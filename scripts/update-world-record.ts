import { config } from 'dotenv'

// load .env file
config()

import type { ScoreListBody } from '@ddradar/core/api/score'
import type { ScoreSchema } from '@ddradar/core/db/scores'
import {
  difficultyMap as diff,
  playStyleMap as style,
} from '@ddradar/core/db/songs'
import { getContainer } from '@ddradar/db'
import consola from 'consola'
import fetch from 'node-fetch'
import * as puppetter from 'puppeteer-core'

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

/** Update World Record from e-AMUSEMENT GATE */
async function main(userId: string, password: string) {
  const browserOptions = { headless: false, executablePath, userDataDir }
  const browser = await puppetter.launch(browserOptions)

  const page = (await browser.pages())[0] || (await browser.newPage())

  // Login check
  if (!(await isLoggedIn(page))) {
    consola.warn('Please Login e-AMUSEMENT GATE manually')
    await browser.close()
    return
  }

  // Load no MFCed top score from DDRadar DB
  const container = getContainer('Scores')
  const { resources } = await container.items
    .query<
      Pick<ScoreSchema, 'songId' | 'songName' | 'playStyle' | 'difficulty'>
    >(
      'SELECT s.songId, s.songName, s.playStyle, s.difficulty ' +
        'FROM s ' +
        'WHERE s.userId = "0" AND s.clearLamp != 7 AND NOT IS_DEFINED(s.ttl) ' +
        'ORDER BY s.songName'
    )
    .fetchAll()

  // Grouped by song
  const scores = resources.reduce((prev, score) => {
    if (prev[score.songId]) {
      prev[score.songId].push(score)
    } else {
      prev[score.songId] = [score]
    }
    return prev
  }, {} as Record<string, Pick<ScoreSchema, 'songId' | 'songName' | 'playStyle' | 'difficulty'>[]>)

  for (const grp of Object.entries(scores)) {
    const songScope = consola.withScope('Song')
    const songName = `${grp[1][0].songName} (${grp[0]})`
    songScope.start(songName)
    const scores: ScoreListBody[] = []

    for (const s of grp[1]) {
      const chartScope = songScope.withScope('Charts')
      const chart = `${style.get(s.playStyle)}/${diff.get(s.difficulty)}`

      try {
        const score = await fetchScoreDetail(
          page,
          s.songId,
          s.playStyle,
          s.difficulty
        )
        if (score) {
          scores.push(score)
          chartScope.success(
            `${chart} (${score.topScore}) Loaded. wait 3 seconds...`
          )
        }
      } catch (e) {
        const message: string = e?.message ?? e
        if (!/NO PLAY/.test(message)) throw e
        chartScope.info('NO PLAY')
      }
      await sleep(3000)
    }

    if (scores.length === 0) {
      songScope.info('No scores. skiped')
      continue
    }

    const apiUri = `${apiBasePath}/api/v1/scores/${grp[0]}/${userId}`
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

  await browser.close()
}

// yarn start ./update-world-record.ts userId password
main(process.argv[2], process.argv[3]).catch(e => consola.error(e))
