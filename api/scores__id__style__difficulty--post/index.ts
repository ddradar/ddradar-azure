import type { ItemDefinition } from '@azure/cosmos'
import type { Context, HttpRequest } from '@azure/functions'
import type { Database, Song } from '@ddradar/core'
import { Score } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, getBindingNumber, SuccessResult } from '../function'

type SongInput = Pick<Database.SongSchema, 'id' | 'name' | 'deleted'> & {
  isCourse: boolean
  charts: ReadonlyArray<Database.StepChartSchema | Database.CourseChartSchema>
}

type PostScoreResult = {
  httpResponse: ErrorResult<400 | 404> | SuccessResult<Database.ScoreSchema>
  documents?: (Database.ScoreSchema & ItemDefinition)[]
}

/** Add or update score that match the specified chart. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  songs: SongInput[],
  scores: (Database.ScoreSchema & ItemDefinition)[]
): Promise<PostScoreResult> {
  const user = await getLoginUserInfo(getClientPrincipal(req))
  if (!user) {
    return {
      httpResponse: new ErrorResult(404, 'User registration is not completed'),
    }
  }

  if (!Score.isScore(req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is not Score') }
  }

  const playStyle: Song.PlayStyle = bindingData.playStyle
  const difficulty = getBindingNumber(
    bindingData,
    'difficulty'
  ) as Song.Difficulty

  // Get chart info
  if (songs.length !== 1) return { httpResponse: new ErrorResult(404) }
  const song = songs[0]
  const chart = song.charts.find(
    c => c.playStyle === playStyle && c.difficulty === difficulty
  )
  if (!chart) return { httpResponse: new ErrorResult(404) }

  if (!Score.isValidScore(chart, req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is invalid Score') }
  }

  const userScore: Database.ScoreSchema = {
    userId: user.id,
    userName: user.name,
    isPublic: user.isPublic,
    songId: song.id,
    songName: song.name,
    playStyle,
    difficulty,
    level: chart.level,
    score: req.body.score,
    clearLamp: req.body.clearLamp,
    rank: req.body.rank,
    ...(req.body.exScore ? { exScore: req.body.exScore } : {}),
    ...(req.body.maxCombo ? { maxCombo: req.body.maxCombo } : {}),
  }
  if (req.body.clearLamp === 7) {
    userScore.exScore = (chart.notes + chart.freezeArrow + chart.shockArrow) * 3
  }
  if (req.body.clearLamp >= 4) {
    userScore.maxCombo = chart.notes + chart.shockArrow
  }
  const documents: (Database.ScoreSchema & ItemDefinition)[] = [
    {
      ...userScore,
      ...(song.isCourse
        ? {}
        : {
            radar: Score.calcMyGrooveRadar(
              chart as Database.StepChartSchema,
              userScore
            ),
          }),
      ...(song.deleted ? { deleted: true } : {}),
    },
    ...scores.filter(s => s.userId === user.id).map(s => ({ ...s, ttl: 3600 })),
  ]

  if (user.isPublic) {
    updateAreaScore('0', userScore)
    if (user.area) {
      updateAreaScore(`${user.area}`, userScore)
    }
  }

  return { httpResponse: new SuccessResult(documents[0]), documents }

  /** Add new Area Top score into documents if greater than old one. */
  function updateAreaScore(area: string, score: Database.ScoreSchema) {
    // Get previous score
    const oldScore = scores.find(s => s.userId === area)

    const mergedScore: Database.ScoreSchema = {
      ...Score.mergeScore(
        oldScore ?? { score: 0, rank: 'E', clearLamp: 0 },
        score
      ),
      userId: area,
      userName: area,
      isPublic: false,
      songId: score.songId,
      songName: score.songName,
      playStyle: score.playStyle,
      difficulty: score.difficulty,
      level: score.level,
    }
    if (
      mergedScore.score === oldScore?.score &&
      mergedScore.clearLamp === oldScore.clearLamp &&
      mergedScore.exScore === oldScore.exScore &&
      mergedScore.maxCombo === oldScore.maxCombo &&
      mergedScore.rank === oldScore.rank
    ) {
      return
    }

    documents.push(mergedScore)
    if (oldScore) documents.push({ ...oldScore, ttl: 3600 })
  }
}
