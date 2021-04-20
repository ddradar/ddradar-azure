import type { Song } from '@ddradar/core'
import { Gate } from '@ddradar/core'
import { config } from 'dotenv'
import { JSDOM } from 'jsdom'
import type { Page } from 'puppeteer-core'

import { isCourse } from './song'

// load .env file
config()

/* eslint-disable node/no-process-env */
const { KONAMI_ID: loginId, KONAMI_PASSWORD: password } = process.env
/* eslint-enable node/no-process-env */

global.DOMParser = new JSDOM().window.DOMParser

export async function isLoggedIn(page: Page): Promise<boolean> {
  const mypageUri = 'https://p.eagate.573.jp/gate/p/mypage/'
  await page.goto(mypageUri)

  if (mypageUri === (await page.evaluate(() => document.location.href))) {
    return true
  }

  if (!loginId || !password) return false

  if (!(await page.$eval('#id_userId', el => (el as HTMLInputElement).value))) {
    await page.type('#id_userId', loginId)
  }
  if (
    !(await page.$eval('#id_password', el => (el as HTMLInputElement).value))
  ) {
    await page.type('#id_password', password)
  }
  await page.click('.btn-area p.btn a', { delay: 500 })
  await page.waitForNavigation({
    timeout: 30000,
    waitUntil: 'domcontentloaded',
  })

  return mypageUri === (await page.evaluate(() => document.location.href))
}

const playDataUri = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata'

export async function fetchScoreDetail(
  page: Page,
  songId: string,
  playStyle: Song.PlayStyle,
  difficulty: Song.Difficulty
): Promise<ReturnType<typeof Gate.musicDetailToScore> | null> {
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = `${playDataUri}/${
    isCourse(songId) ? 'course' : 'music'
  }_detail.html?index=${songId}&diff=${index}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return Gate.musicDetailToScore(source)
}

export async function fetchScoreList(
  page: Page,
  pageNo: number,
  playStyle: Song.PlayStyle
): Promise<ReturnType<typeof Gate.musicDataToScoreList> | null> {
  const style = playStyle === 1 ? 'single' : 'double'
  const detailUri = `${playDataUri}/music_data_${style}.html?offset=${pageNo}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return Gate.musicDataToScoreList(source)
}

const rivalDataUri = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival'

export async function fetchRivalScoreDetail(
  page: Page,
  ddrCode: number,
  songId: string,
  playStyle: Song.PlayStyle,
  difficulty: Song.Difficulty
): Promise<ReturnType<typeof Gate.musicDetailToScore> | null> {
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = `${rivalDataUri}/music_detail.html?index=${songId}&rival_id=${ddrCode}&diff=${index}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return Gate.musicDetailToScore(source)
}

export async function fetchRivalScoreList(
  page: Page,
  ddrCode: number,
  pageNo: number,
  playStyle: Song.PlayStyle
): Promise<ReturnType<typeof Gate.musicDataToScoreList> | null> {
  const style = playStyle === 1 ? 'single' : 'double'
  const detailUri = `${rivalDataUri}/rival_musicdata_${style}.html?offset=${pageNo}&rival_id=${ddrCode}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return Gate.musicDataToScoreList(source)
}
