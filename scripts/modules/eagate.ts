import type { Difficulty, PlayStyle } from '@ddradar/core/db/songs'
import {
  musicDataToScoreList,
  musicDetailToScore,
} from '@ddradar/core/eagate-parser'
import { JSDOM } from 'jsdom'
import type { Page } from 'puppeteer-core'

global.DOMParser = new JSDOM().window.DOMParser

export async function isLoggedIn(page: Page): Promise<boolean> {
  const mypageUri = 'https://p.eagate.573.jp/gate/p/mypage/'
  await page.goto(mypageUri)

  const currentUri = await page.evaluate(() => document.location.href)
  return mypageUri === currentUri
}

const playDataUri = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata'

export async function fetchScoreDetail(
  page: Page,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
): Promise<ReturnType<typeof musicDetailToScore> | null> {
  const isCourse = [
    '19id1DO6q9Pb1681db61D8D8oQi9dlb6',
    'b9OboQl6d9PqQddIdQDobP0d8o6dOqob',
    'P986dlQP0DO0106oq0P81Qi0QQDQ666O',
    'o0DP6qqql9D1bDbQPOQiP8iIq81qI8O9',
    '880I00ODqPD1OQQPOP0Pd19Qq1qiloDP',
    'PbIq9b1I161P0iD18qQiOO9qIoodbDIP',
    '666q06q6I01loQOq0qd98IIOObIDOd8q',
    'l8Q1Od0d0IQOQl61l8lIlPiI80P10OQb',
    'ol8oiPo8iod9bDPPD1qdlbPd1ddqP6oP',
    'OPi8oobIDid6q0P18QdD11D6O1I6Ioqo',
    'qDDlD0blPO68IQiOQ8i1qPDd8IOPIIO6',
    '9IliQ1O0dOQPiObPDDDblDO6oliDodlb',
    'IlQodD9Dbld8QiOql68bPPQbd6bll6i1',
    'dib16I1b0o9OdOd1O90dO1Q6iIO9PQo9',
    '8OoDQb16lP0i96qiDQqo90Q6bOP1o89D',
    'ddql809Qo8q68918lIDOPDQ6q1liD9b6',
    '9D69dQo1dQqPD6l9ObiI0b0i8d9ddool',
    'Pbbidbl9l8IqddQOq0069oQ6Oi1DQdP1',
    'idiOI1Qb9D0dQI6IOlob8QbOqdDOoObP',
    'ID9Dqo9QQQIP9ObD0lbbi6O6PiD18oD0',
    'bPQDblO8Do0Oo9O0PP0b8PO1PblDioDP',
    'o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db',
    '6bo6ID6l11qd6lolilI6o6q8I6ddo88i',
    'd0l89dI9d6Di11DQ9P8D1Pl1d0Db81D9',
    'b6qOqD9bOQO1O0q8000D6dIdqb80li1b',
    '6loIiOd8PP90dPOq16Q6PdPPO0DQDOPP',
    '91DOoD99iIq9oIdOi9QqDQ0qlQPQPOii',
    'odPd96PliIo9OIO8q8iD8Qd6QoId6o1d',
    'l6Pd9dQdoq1qI9iOOqdbDQI0qiQioP60',
    'O91QbQb0QdObIO6d8lo8lq00ibOQP9PQ',
    'OdOP8o0dQdo0DPiio6dI8QId869D9oqd',
    'o11OO8oodDODD0oolD6ql6DiODPQboOo',
    '6q6Oil608iDQlOD86d1qiDPo8Dd8IP16',
    'bIb6Q6DD9iP1d61dbOqdi6IQPllOb1IP',
    'iDiiO18PPl6iDlDlddi9ildIqO60bQdo',
    'Iblb8l6qPOQD8do891b1O0Pd9q60b6oD',
    'ilD1Qb1IqqDP1bo1i66q688q6doPq6Qb',
    'q0IObiQdI9o918O0DbPlldqd01liQ8Ql',
    'dO01ddIq0bq9019olIDoD1IIPIb9DQ9D',
    'b0DliOIqlP9lldO9qQo0986QIo9io96d',
    'oiqql6iPq8Oq0QIqlqb1DOOO8ioPo8b9',
    'DQqi68IP1qbDiQ9li6PI1Q9Iddd6o9QQ',
    '9O0b1DddI6OiOD6PQbboPbdd8Pi1iPlb',
    '199ODd8l0Qld9i6DdqOdb1ll66D1I1Q9',
    'qbbOOO1QibO1861bqQII9lqlPiIoqb98',
    'I90bQ81P1blOPIdd9PPl6I9D8DQ1dIob',
    '88o8Oq69ldilblP10DI0qqb6b8I0DDi9',
    'q6oOPqQPlOQoooq888bPI1OPDlqDIQQD',
    'i1DqPb01I6I1dP8qoO1qiIPDlOD9D9oQ',
    'DQilQP810dq8D9i11q6Oq0ooDdQQO0lI',
    'l1o0olodIDDiqDQ101obOD1qo81q0QOP',
    'O6Pi0O800b8b6d9dd9P89dD1900I1q80',
    'dqQD9ilqIIilOQi986Ql6dd1ldiPob88',
    'Plld00DiIO9bPqdq190li1iIPDdq6Qlb',
    'diOIbOoPIPO9DP1QiOi9QdOlqQbI8Old',
    'lqi1olqq0bq0O08i8qPOIlqDD68qoObP',
    '6oIoo19P98qPqbboqoPDlqb0qqb08oO9',
    'l98qQo00ddOPq6PIDqqQO0DOdDbdbl9Q',
    'PPqP0q8liql0o9ilo66bDiQl0O0dIldQ',
    '08io99Obq06Oq6bD6Pq999PDOOb6Oo8o',
    'DO1OqlIdi9O0IDIQ9il1IoOqI86Id0Q0',
  ].includes(songId)
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = `${playDataUri}/${
    isCourse ? 'course' : 'music'
  }_detail.html?index=${songId}&diff=${index}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return musicDetailToScore(source)
}

export async function fetchScoreList(
  page: Page,
  pageNo: number,
  playStyle: PlayStyle
): Promise<ReturnType<typeof musicDataToScoreList> | null> {
  const style = playStyle === 1 ? 'single' : 'double'
  const detailUri = `${playDataUri}/music_data_${style}.html?offset=${pageNo}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return musicDataToScoreList(source)
}

const rivalDataUri = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival'

export async function fetchRivalScoreDetail(
  page: Page,
  ddrCode: number,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
): Promise<ReturnType<typeof musicDetailToScore> | null> {
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = `${rivalDataUri}/music_detail.html?index=${songId}&rival_id=${ddrCode}&diff=${index}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return musicDetailToScore(source)
}

export async function fetchRivalScoreList(
  page: Page,
  ddrCode: number,
  pageNo: number,
  playStyle: PlayStyle
): Promise<ReturnType<typeof musicDataToScoreList> | null> {
  const style = playStyle === 1 ? 'single' : 'double'
  const detailUri = `${rivalDataUri}/rival_musicdata_${style}.html?offset=${pageNo}&rival_id=${ddrCode}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return musicDataToScoreList(source)
}
