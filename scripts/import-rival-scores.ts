import { config } from 'dotenv'

// load .env file
config()

import { fetchOne } from '@ddradar/db'
import consola from 'consola'
import fetch from 'node-fetch'
import { launch } from 'puppeteer-core'

import { fetchRivalScoreList, isLoggedIn } from './modules/eagate'

/* eslint-disable node/no-process-env */
const {
  CHROME_EXE_PATH: executablePath,
  CHROME_USER_PATH: userDataDir,
  BASE_URI: apiBasePath,
} = process.env
/* eslint-enable node/no-process-env */

async function main(ddrCode: string) {
  const code = parseInt(ddrCode, 10)
  if (!Number.isInteger(code) || code < 10000000 || code > 99999999) {
    consola.warn(`Invalid DDR Code (${ddrCode}).`)
    return
  }

  const browser = await launch({ executablePath, userDataDir })

  const page = (await browser.pages())[0] || (await browser.newPage())

  // Login check
  if (!(await isLoggedIn(page))) {
    consola.warn('Please Login e-AMUSEMENT GATE manually')
    await browser.close()
    return
  }

  // Fetch user info
  const user = await fetchOne('Users', ['id', 'name', 'password'], {
    condition: 'c.code = @',
    value: code,
  })
  if (!user) {
    consola.warn(`Not Found DDR-Code:${code} user.`)
    return
  }
  consola.info(`Found User: ${user.id}: ${user.name}`)

  for (let offset = 0; offset < 20; offset++) {
    consola.start(`Song List ${offset + 1}/20`)

    const singleScores =
      (await fetchRivalScoreList(page, code, offset, 1)) ?? {}
    const doubleScores =
      (await fetchRivalScoreList(page, code, offset, 2)) ?? {}
    Object.entries(doubleScores).reduce((prev, [id, scores]) => {
      if (prev && prev[id]) {
        prev[id] = [...prev[id], ...scores]
      } else {
        prev[id] = scores
      }
      return prev
    }, singleScores)

    for (const [id, scores] of Object.entries(singleScores)) {
      const songScope = consola.withScope('Song')
      const songName = `${scores[0].songName} (${id})`

      if (scores.length === 0) {
        songScope.info('No scores. skiped')
        continue
      }

      const apiUri = `${apiBasePath}/api/v1/scores/${id}/${user.id}`
      const res = await fetch(apiUri, {
        method: 'post',
        body: JSON.stringify({ password: user.password, scores }),
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
    consola.success(`End Song List ${offset + 1}/20`)
  }

  consola.info(`Done.`)
  await browser.close()
}

// yarn start ./import-rival-scores.ts 10000000
main(process.argv[2]).catch(e => consola.error(e))
