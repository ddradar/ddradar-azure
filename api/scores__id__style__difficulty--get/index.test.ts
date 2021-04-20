import type { HttpRequest } from '@azure/functions'
import type { Database } from '@ddradar/core'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import getChartScore from '.'

jest.mock('../auth')

describe('GET /api/v1/scores', () => {
  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  const user = {
    id: 'private_user',
    loginId: 'private_user',
    name: 'EMI',
    area: 13,
    isPublic: false,
  } as const
  const score = {
    songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    songName: 'PARANOiA',
    playStyle: 1,
    difficulty: 0,
    level: 4,
    score: 1000000,
    clearLamp: 7,
    rank: 'AAA',
    isPublic: false,
  } as const
  const scores: Database.ScoreSchema[] = [
    { userId: '0', userName: '0', ...score, exScore: 138 * 3, maxCombo: 138 },
    { userId: '13', userName: '13', ...score },
    { userId: 'public_user', userName: 'AFRO', ...score, isPublic: true },
    { userId: 'other_user', userName: 'ZERO', ...score, isPublic: false },
    { userId: user.id, userName: user.name, ...score, isPublic: user.isPublic },
  ]

  const omitScore = (i: number) => ({
    userId: scores[i].userId,
    userName: scores[i].userName,
    songId: scores[i].songId,
    songName: scores[i].songName,
    playStyle: scores[i].playStyle,
    difficulty: scores[i].difficulty,
    level: scores[i].level,
    score: scores[i].score,
    clearLamp: scores[i].clearLamp,
    rank: scores[i].rank,
    ...(scores[i].maxCombo ? { maxCombo: scores[i].maxCombo } : {}),
    ...(scores[i].exScore ? { exScore: scores[i].exScore } : {}),
  })

  beforeEach(() => {
    req.query = {}
    mocked(getLoginUserInfo).mockResolvedValue(user)
  })

  test('?scope=private returns "404 Not Found" if anonymous', async () => {
    // Arrange
    req.query.scope = 'private'
    mocked(getLoginUserInfo).mockResolvedValueOnce(null)

    // Act
    const result = await getChartScore(null, req, scores)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each(['private', 'medium', 'full', '', undefined])(
    '?scope=%s returns "404 Not Found" if scores is empty',
    async scope => {
      // Arrange
      req.query.scope = scope

      // Act
      const result = await getChartScore(null, req, [])

      // Assert
      expect(result.status).toBe(404)
    }
  )

  test.each([
    ['private', [omitScore(4)]],
    ['medium', [omitScore(0), omitScore(1), omitScore(4)]],
    ['full', [omitScore(0), omitScore(1), omitScore(2), omitScore(4)]],
  ])(
    '?scope=%s returns "200 OK" with %p if authenticated',
    async (scope, expected) => {
      // Arrange
      req.query.scope = scope

      // Act
      const result = await getChartScore(null, req, scores)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual(expected)
    }
  )

  test.each([
    ['medium', [omitScore(0)]],
    ['full', [omitScore(0), omitScore(2)]],
  ])(
    '?scope=%s returns "200 OK" with %p if no authentication',
    async (scope, expected) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(null)
      req.query.scope = scope

      // Act
      const result = await getChartScore(null, req, scores)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual(expected)
    }
  )
})
