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

/** Update World Record from e-AMUSEMENT GATE */
async function main(userId: string, password: string) {
  const browserOptions = { executablePath, userDataDir }
  const browser = await launch(browserOptions)

  const page = (await browser.pages())[0] || (await browser.newPage())

  // Login check
  if (!(await isLoggedIn(page))) {
    consola.warn('Please Login e-AMUSEMENT GATE manually')
    await browser.close()
    return
  }

  // Load no MFCed top score from DDRadar DB
  const resources = await fetchList(
    'Scores',
    ['songId', 'songName', 'playStyle', 'difficulty', 'score'],
    [
      { condition: 'c.userId = "0"' },
      { condition: 'c.clearLamp != 7' },
      { condition: '(NOT IS_DEFINED(c.deleted))' },
      { condition: '(NOT IS_DEFINED(c.ttl))' },
    ],
    { songName: 'ASC' }
  )

  // Grouped by song
  const scores = resources.reduce((prev, score) => {
    if (prev[score.songId]) {
      prev[score.songId].push(score)
    } else {
      prev[score.songId] = [score]
    }
    return prev
  }, {} as Record<string, typeof resources>)

  const total = Object.keys(scores).length
  let count = 1
  const logs: string[] = []

  for (const [id, score] of Object.entries(scores)) {
    const songScope = consola.withScope('song')
    const songName = `(${count++}/${total}) ${score[0].songName} (${id})`
    songScope.start(songName)

    const scores: Api.ScoreListBody[] = []

    for (const s of score) {
      const chartScope = songScope.withScope('charts')
      const chart = `${style.get(s.playStyle)}/${diff.get(s.difficulty)}`

      try {
        const score = await fetchScoreDetail(
          page,
          s.songId,
          s.playStyle,
          s.difficulty
        )
        if (score) {
          if (score.topScore > s.score) {
            scores.push(score)
            logs.push(
              `${s.songName}(${s.songId}) [${chart}] (${s.score} -> ${
                score.topScore
              }) at ${new Date()}`
            )
            chartScope.success(
              `${chart} (${score.topScore}) Loaded. wait 3 seconds...`
            )
          }
        }
      } catch (e) {
        const message: string = e?.message ?? e
        if (!/NO PLAY/.test(message)) {
          for (const log of logs) {
            consola.success(log)
          }
          await browser.close()
          throw e
        }
      }
      await sleep(3000)
    }

    if (scores.length === 0) {
      songScope.info('No scores. skiped')
      continue
    }

    const apiUri = `${apiBasePath}/api/v1/scores/${id}/${userId}`
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
  }

  for (const log of logs) {
    consola.success(log)
  }

  await browser.close()
}

// yarn start ./update-world-record.ts userId password
main(process.argv[2], process.argv[3]).catch(e => consola.error(e))
