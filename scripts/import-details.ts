/* eslint-disable no-console */
/* eslint-disable node/no-process-env */
import type { Api, Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { getContainer } from '@ddradar/db'
import { config } from 'dotenv'
import fetch from 'node-fetch'
import * as puppetter from 'puppeteer-core'

import { fetchScoreDetail, isLoggedIn } from './modules/eagate'

// load .env file
config()

const executablePath = process.env.CHROME_EXE_PATH
const userDataDir = process.env.CHROME_USER_PATH

const apiBasePath = process.env.BASE_URI

const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec))

async function main(userId: string, password: string) {
  const browser = await puppetter.launch({
    headless: false,
    executablePath,
    userDataDir,
  })

  const page = (await browser.pages())[0] || (await browser.newPage())

  if (!(await isLoggedIn(page))) {
    console.warn('Need Login e-AMUSEMENT GATE')
    await browser.close()
    return
  }

  const container = getContainer('Songs')
  const { resources } = await container.items
    .query<Pick<Database.SongSchema, 'id' | 'name' | 'charts'>>({
      query:
        'SELECT s.id, s.name, s.charts ' +
        'FROM s ' +
        'WHERE s.nameIndex > 0 AND s.series = @series ' +
        'ORDER BY s.nameIndex, s.nameKana',
      parameters: [{ name: '@series', value: 'DDR 1st' }],
    })
    .fetchAll()

  for (const s of resources) {
    console.info(`[Song] ${s.name} START`)
    const scores: Api.ScoreListBody[] = []
    for (const c of s.charts) {
      const chart = `${Song.playStyleMap.get(
        c.playStyle
      )}/${Song.difficultyMap.get(c.difficulty)}`
      console.log(`  (${chart}) loading score detail`)

      try {
        const score = await fetchScoreDetail(
          page,
          s.id,
          c.playStyle,
          c.difficulty
        )
        if (score) scores.push(score)
      } catch (e) {
        const message: string = e?.message ?? e
        if (!/NO PLAY/.test(message)) throw e
        console.info(`  (${chart}) NO PLAY.`)
      }

      console.log(`  (${chart}) loaded. wait 3 seconds...`)
      await sleep(3000)
    }

    if (scores.length === 0) {
      console.log('  No scores. skiped')
      console.info(`[Song] ${s.name} END`)
      continue
    }
    console.log('  Call API start')
    const apiUri = `${apiBasePath}/api/v1/scores/${s.id}/${userId}`
    const response = await fetch(apiUri, {
      method: 'post',
      body: JSON.stringify({ password, scores }),
      headers: { 'Content-Type': 'application/json' },
    })
    console.log(`  API returns ${response.statusText}`)

    console.info(`[Song] ${s.name} END`)
  }

  await browser.close()
}

// yarn start ./import-details.ts userId password
main(process.argv[2], process.argv[3]).catch(e => console.error(e))
