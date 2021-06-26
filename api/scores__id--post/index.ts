import type { ItemDefinition } from '@azure/cosmos'
import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'
import { hasIntegerProperty, hasProperty, Score } from '@ddradar/core'
import { fetchScore } from '@ddradar/db'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type SongInput = Pick<Database.SongSchema, 'id' | 'name' | 'deleted'> & {
  isCourse: boolean
  charts: ReadonlyArray<Database.StepChartSchema | Database.CourseChartSchema>
}

type PostSongScoresResponse = {
  httpResponse:
    | ErrorResult<400 | 401 | 404>
    | SuccessResult<Database.ScoreSchema[]>
  documents?: (Database.ScoreSchema & ItemDefinition)[]
}

const topUser = { id: '0', name: '0', isPublic: false } as const

/** Add or update score that match the specified chart. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'body'>,
  [song]: SongInput[]
): Promise<PostSongScoresResponse> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { httpResponse: { status: 401 } }

  if (!isValidBody(req.body)) {
    return { httpResponse: new ErrorResult(400, 'body is not Score[]') }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    const body = `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`
    return { httpResponse: new ErrorResult(404, body) }
  }

  // Get chart info
  if (!song) return { httpResponse: new ErrorResult(404) }

  const documents: (Database.ScoreSchema & ItemDefinition)[] = []
  const body: Database.ScoreSchema[] = []
  for (let i = 0; i < req.body.length; i++) {
    const score = req.body[i]
    const chart = song.charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return { httpResponse: new ErrorResult(404) }
    if (!Score.isValidScore(chart, score)) {
      return {
        httpResponse: new ErrorResult(400, `body[${i}] is invalid Score`),
      }
    }

    body.push({
      ...createSchema(chart, user, score),
      ...(song.isCourse
        ? {}
        : {
            radar: Score.calcMyGrooveRadar(
              chart as Database.StepChartSchema,
              score
            ),
          }),
    })
    await fetchMergedScore(chart, user, score, false)

    // World Record
    if (score.topScore) {
      const topScore: Api.ScoreBody = {
        score: score.topScore,
        clearLamp: 2,
        rank: Score.getDanceLevel(score.topScore),
      }
      await fetchMergedScore(chart, topUser, topScore)
    } else if (user.isPublic) {
      await fetchMergedScore(chart, topUser, score)
    }

    // Area Top
    if (user.isPublic && user.area) {
      const area = `${user.area}`
      const areaUser = { ...topUser, id: area, name: area }
      await fetchMergedScore(chart, areaUser, score)
    }
  }

  return { httpResponse: new SuccessResult(body), documents }

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is Api.ScoreListBody[] {
    return (
      Array.isArray(body) && body.length > 0 && body.every(d => isScoreBody(d))
    )

    function isScoreBody(obj: unknown): obj is Api.ScoreListBody {
      return (
        Score.isScore(obj) &&
        hasIntegerProperty(obj, 'playStyle', 'difficulty') &&
        [1, 2].includes(obj.playStyle) &&
        [0, 1, 2, 3, 4].includes(obj.difficulty) &&
        (!hasProperty(obj, 'topScore') || hasIntegerProperty(obj, 'topScore'))
      )
    }
  }

  /**
   * Create ScoreSchema from chart, User and score.
   * Also complement exScore and maxCombo.
   */
  function createSchema(
    chart: Readonly<Database.StepChartSchema | Database.CourseChartSchema>,
    user: Readonly<Pick<Database.UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Api.ScoreBody>
  ) {
    const scoreSchema: Database.ScoreSchema = {
      userId: user.id,
      userName: user.name,
      isPublic: user.isPublic,
      songId: song.id,
      songName: song.name,
      playStyle: chart.playStyle,
      difficulty: chart.difficulty,
      level: chart.level,
      score: score.score,
      clearLamp: score.clearLamp,
      rank: score.rank,
      ...(song.deleted ? { deleted: true } : {}),
    }
    if (score.exScore) scoreSchema.exScore = score.exScore
    if (score.maxCombo) scoreSchema.maxCombo = score.maxCombo

    // calc clearLamp from score
    const baseScore =
      1000000 / (chart.notes + chart.freezeArrow + chart.shockArrow)
    if (score.score === 1000000) scoreSchema.clearLamp = 7
    // Score is greater than Gr:1
    else if (score.score > 999990 - baseScore * 0.4) scoreSchema.clearLamp = 6

    if (scoreSchema.clearLamp >= 6) {
      const exScore = (chart.notes + chart.freezeArrow + chart.shockArrow) * 3
      scoreSchema.exScore = exScore - (1000000 - score.score) / 10
    }
    if (scoreSchema.clearLamp >= 4) {
      scoreSchema.maxCombo = chart.notes + chart.shockArrow
    }
    return scoreSchema
  }

  /** Merge score is merged old one. */
  async function fetchMergedScore(
    chart: Readonly<Database.StepChartSchema | Database.CourseChartSchema>,
    user: Readonly<Pick<Database.UserSchema, 'id' | 'name' | 'isPublic'>>,
    score: Readonly<Api.ScoreBody>,
    isAreaUser = true
  ): Promise<void> {
    const scoreSchema = createSchema(chart, user, score)
    // Get previous score
    const oldScore = await fetchScore(
      scoreSchema.userId,
      scoreSchema.songId,
      scoreSchema.playStyle,
      scoreSchema.difficulty
    )

    const mergedScore: Database.ScoreSchema = {
      ...Score.mergeScore(
        oldScore ?? { score: 0, rank: 'E', clearLamp: 0 },
        scoreSchema
      ),
      userId: scoreSchema.userId,
      userName: scoreSchema.userName,
      isPublic: scoreSchema.isPublic,
      songId: scoreSchema.songId,
      songName: scoreSchema.songName,
      playStyle: scoreSchema.playStyle,
      difficulty: scoreSchema.difficulty,
      level: scoreSchema.level,
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

    if (!isAreaUser && !song.isCourse) {
      mergedScore.radar = Score.calcMyGrooveRadar(
        chart as Database.StepChartSchema,
        mergedScore
      )
    }

    documents.push(mergedScore)
    if (oldScore) documents.push({ ...oldScore, ttl: 3600 })
  }
}
