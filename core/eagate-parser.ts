/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ScoreInfo } from './api/score'
import type { DanceLevel } from './db/scores'
import { getDanceLevel } from './score'

const idRegex = /^.+\/ddr\/ddra20\/p.+=([01689bdiloqDIOPQ]{32}).*$/
const srcRegex = /^.+\/ddr\/ddra20\/p\/images\/play_data\/(.+)\.png$/

type EagateScore = Omit<ScoreInfo, 'songId' | 'userId' | 'userName' | 'level'>

/**
 * Convert music data to { songId: Score[] } Record.
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/nonstop_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/nonstop_data_double.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/grade_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/grade_data_double.html
 */
export function musicDataToScoreList(
  sourceCode: string
): Record<string, EagateScore[]> {
  const doc = new DOMParser().parseFromString(sourceCode, 'text/html')
  const dataTable = doc.getElementById('data_tbl')
  if (!dataTable) throw new Error('invalid html')

  const playStyle = getPlayStyle(dataTable)

  const result: Record<string, EagateScore[]> = {}

  const songs = dataTable.getElementsByClassName('data')
  for (let i = 0; i < songs.length; i++) {
    const songRow = songs[i]

    // Get songName & songId from first column
    const songCol = songRow
      .getElementsByTagName('td')[0]
      .getElementsByClassName('music_info')[0]
    const jacketAlt = songCol.getElementsByTagName('img')[0]?.alt // for NONSTOP or 段位認定
    const songId = songCol.getAttribute('href')?.replace(idRegex, '$1')
    const songName = songCol.textContent!.trim() || jacketAlt
    if (!songId || !songName) continue

    result[songId] = []

    const charts = songRow.getElementsByClassName('rank')
    for (let j = 0; j < charts.length; j++) {
      const chart = charts[j]

      // Get difficulty
      const difficulty = getDifficulty(chart.id.toLowerCase())

      // Get score
      const scoreText =
        chart.getElementsByClassName('data_score')[0].textContent
      const score = parseInt(scoreText!, 10)
      if (!Number.isInteger(score) || score < 0 || score > 1000000) continue

      // Get clearLamp
      const fcImageUrl = chart
        .getElementsByClassName('music_info')[0]
        .getElementsByTagName('img')[1]
        .src.toLowerCase()
      const rankImageFileName = chart
        .getElementsByClassName('music_info')[0]
        .getElementsByTagName('img')[0]
        .src.replace(srcRegex, '$1')
      const isFailed = rankImageFileName === 'rank_s_e'
      const clearLamp =
        getClearLamp(fcImageUrl) ?? (isFailed ? 0 : score === 0 ? 1 : 2)

      // Get rank
      const rank = isFailed ? 'E' : getDanceLevel(score)

      result[songId].push({
        songName,
        playStyle,
        difficulty,
        score,
        clearLamp,
        rank,
      })
    }
  }
  return result

  /** Get playStyle from element */
  function getPlayStyle(dataTable: HTMLElement) {
    // Get PlayStyle from columns count
    const headerColumns =
      dataTable
        .getElementsByClassName('column')[0]
        ?.getElementsByClassName('rank')?.length ||
      dataTable
        .getElementsByClassName('column')[0]
        ?.getElementsByClassName('rank_a')?.length
    if (headerColumns === 5) return 1 // BEGINNER, BASIC, DIFFICULT, EXPERT, CHALLENGE
    if (headerColumns === 4) return 2 // BASIC, DIFFICULT, EXPERT, CHALLENGE
    if (headerColumns !== 1) throw new Error('invalid html')

    // if 段位認定, find 1st Dan Course id
    const single1stDan = [
      '19id1DO6q9Pb1681db61D8D8oQi9dlb6', // A20
      '6bo6ID6l11qd6lolilI6o6q8I6ddo88i', // A20 PLUS
    ]
    const double1stDan = [
      '9IliQ1O0dOQPiObPDDDblDO6oliDodlb', // A20
      'bIb6Q6DD9iP1d61dbOqdi6IQPllOb1IP', // A20 PLUS
    ]
    const songs = dataTable.getElementsByClassName('data')
    for (let i = 0; i < songs.length; i++) {
      const songId = songs[i]
        .getElementsByTagName('td')[0]
        .getElementsByClassName('music_info')[0]
        .getAttribute('href')!
        .replace(idRegex, '$1')
      if (single1stDan.includes(songId!)) return 1
      if (double1stDan.includes(songId!)) return 2
    }
    throw new Error('invalid html')
  }

  /** Get chart difficulty from element id */
  function getDifficulty(elementId: string) {
    if (elementId === 'beginner') return 0
    if (elementId === 'basic') return 1
    if (elementId === 'difficult') return 2
    if (elementId === 'expert') return 3
    if (elementId === 'challenge') return 4
    throw new Error('invalid html')
  }

  /** Get ClearLamp from full combo image URL */
  function getClearLamp(imageUrl: string) {
    const fileName = imageUrl.replace(srcRegex, '$1')
    if (fileName === 'full_mar') return 7
    if (fileName === 'full_perfect') return 6
    if (fileName === 'full_great') return 5
    if (fileName === 'full_good') return 4
    return null
  }
}

/**
 * Convert music detail to Score.
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_detail.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/course_detail.html
 */
export function musicDetailToScore(
  sourceCode: string
): Omit<EagateScore, 'songName'> & { songId: string; topScore: number } {
  const doc = new DOMParser().parseFromString(sourceCode, 'text/html')

  // Get songId and songName
  const musicInfoTable = doc.getElementById('music_info')
  if (!musicInfoTable) throw new Error('Invalid HTML')
  const songNameRow = musicInfoTable.getElementsByTagName('tr')[0]
  const songId = songNameRow
    .getElementsByTagName('td')[0]
    .getElementsByTagName('img')[0]
    .src.replace(idRegex, '$1')

  const musicDetailTable =
    doc.getElementById('music_detail_table') ||
    doc.getElementById('course_detail_table')
  if (!musicDetailTable) {
    const message = doc.getElementById('popup_cnt')!.textContent!
    throw new Error(message.replace(/^.+\n *([^ ]+)$/ms, '$1').trim())
  }

  // Get playStyle and difficulty
  const difficultyLogo = musicDetailTable
    .getElementsByTagName('tr')[0]
    .getElementsByTagName('td')[0]
    .getElementsByTagName('img')[0].src
  const { playStyle, difficulty } = getPlayStyleAndDifficulty(difficultyLogo)

  const rank = musicDetailTable
    .getElementsByTagName('tr')[1]
    .getElementsByTagName('td')[0].textContent! as DanceLevel
  const score = parseInt(
    musicDetailTable.getElementsByTagName('tr')[1].getElementsByTagName('td')[1]
      .textContent!,
    10
  )
  const maxCombo = parseInt(
    musicDetailTable.getElementsByTagName('tr')[2].getElementsByTagName('td')[0]
      .textContent!,
    10
  )
  const fullComboText = musicDetailTable
    .getElementsByTagName('tr')[4]
    .getElementsByTagName('td')[0].textContent
  const clearCount = parseInt(
    musicDetailTable.getElementsByTagName('tr')[5].getElementsByTagName('td')[0]
      .textContent!,
    10
  )
  const clearLamp = clearCount === 0 ? 0 : getClearLamp(fullComboText)
  const topScore = parseInt(
    musicDetailTable
      .getElementsByTagName('tr')[3]
      .getElementsByTagName('td')[0]
      .getElementsByTagName('span')[0].textContent!,
    10
  )

  return {
    songId,
    playStyle,
    difficulty,
    score,
    rank,
    clearLamp,
    maxCombo,
    topScore,
  }

  function getPlayStyleAndDifficulty(
    logoUri: string
  ): Pick<ScoreInfo, 'playStyle' | 'difficulty'> {
    const fileName = logoUri.replace(srcRegex, '$1')
    if (fileName === 'songdetails0') return { playStyle: 1, difficulty: 0 }
    if (fileName === 'songdetails1') return { playStyle: 1, difficulty: 1 }
    if (fileName === 'songdetails2') return { playStyle: 1, difficulty: 2 }
    if (fileName === 'songdetails3') return { playStyle: 1, difficulty: 3 }
    if (fileName === 'songdetails4') return { playStyle: 1, difficulty: 4 }
    if (fileName === 'songdetails5') return { playStyle: 2, difficulty: 1 }
    if (fileName === 'songdetails6') return { playStyle: 2, difficulty: 2 }
    if (fileName === 'songdetails7') return { playStyle: 2, difficulty: 3 }
    if (fileName === 'songdetails8') return { playStyle: 2, difficulty: 4 }
    throw new Error('Invalid HTML')
  }

  function getClearLamp(fullComboText: string | null) {
    if (fullComboText === 'マーベラスフルコンボ') return 7
    if (fullComboText === 'パーフェクトフルコンボ') return 6
    if (fullComboText === 'グレートフルコンボ') return 5
    if (fullComboText === 'グッドフルコンボ') return 4
    return 2
  }
}
