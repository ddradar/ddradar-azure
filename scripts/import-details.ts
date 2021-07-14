import { config } from 'dotenv'

// load .env file
config()

import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { fetchList } from '@ddradar/db'
import consola from 'consola'
import fetch from 'node-fetch'
import { launch } from 'puppeteer-core'

import { fetchScoreDetail, isLoggedIn } from './modules/eagate'

/* eslint-disable node/no-process-env */
const {
  CHROME_EXE_PATH: executablePath,
  CHROME_USER_PATH: userDataDir,
  BASE_URI: apiBasePath,
} = process.env
/* eslint-enable node/no-process-env */

const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec))

const style = Song.playStyleMap
const diff = Song.difficultyMap

async function main(userId: string, password: string) {
  const browser = await launch({ executablePath, userDataDir })

  const page = (await browser.pages())[0] || (await browser.newPage())

  if (!(await isLoggedIn(page))) {
    consola.warn('Please Login e-AMUSEMENT GATE manually')
    await browser.close()
    return
  }

  const resources = await fetchList(
    'Songs',
    ['id', 'name', 'charts'],
    [
      { condition: 'c.nameIndex > 0' },
      { condition: 'c.series = @', value: 'DDR 1st' },
    ],
    { nameIndex: 'ASC', nameKana: 'ASC' }
  )

  let count = 1
  for (const s of resources) {
    const songScope = consola.withScope('song')
    const songName = `(${count++}/${resources.length + 1}) ${s.name} (${s.id})`
    if (Song.isDeletedOnGate(s.id)) {
      songScope.info(`${songName} Deleted on e-AMUSEMENT GATE. skiped.`)
      continue
    }
    songScope.start(songName)

    const scores: Api.ScoreListBody[] = []

    for (const c of s.charts) {
      const chartScope = songScope.withScope('chart')
      const chart = `${style.get(c.playStyle)}/${diff.get(c.difficulty)}`

      try {
        const score = await fetchScoreDetail(
          page,
          s.id,
          c.playStyle,
          c.difficulty
        )
        if (score) {
          scores.push(score)
          chartScope.success(`${chart} loaded. wait 3 seconds...`)
        }
      } catch (e) {
        const message: string = e?.message ?? e
        if (!/NO PLAY/.test(message)) {
          await browser.close()
          throw e
        }
        chartScope.info('NO PLAY. wait 3 seconds...')
      }
      await sleep(3000)
    }

    if (scores.length === 0) {
      songScope.info('No scores. skiped')
      continue
    }

    const apiUri = `${apiBasePath}/api/v1/scores/${s.id}/${userId}`
    const res = await fetch(apiUri, {
      method: 'post',
      body: JSON.stringify({ password, scores }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const errorText = await res.text()
      songScope.error(
        'API returns %i: %s.\n%s',
        res.status,
        res.statusText,
        errorText
      )
      continue
    }
    songScope.success(songName)
  }

  consola.success('Finished')
  await browser.close()
}

// yarn start ./import-details.ts userId password
main(process.argv[2], process.argv[3]).catch(e => consola.error(e))
