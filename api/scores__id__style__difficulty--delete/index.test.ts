import type { Database } from '@ddradar/core'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import deleteChartScore from '.'

jest.mock('../auth')

describe('DELETE /api/v1/scores', () => {
  const req = { headers: {} }
  const user = {
    id: 'public_user',
    loginId: 'public_user',
    name: 'AFRO',
    area: 13,
    isPublic: true,
  } as const
  const score: Database.ScoreSchema = {
    userId: user.id,
    userName: user.name,
    isPublic: user.isPublic,
    songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    songName: 'PARANOiA',
    playStyle: 1,
    difficulty: 0,
    level: 4,
    score: 970630, // P:28, Gr:10
    clearLamp: 5,
    rank: 'AA+',
    maxCombo: 138,
    exScore: 366,
  }

  beforeEach(() => {
    mocked(getLoginUserInfo).mockResolvedValue(user)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(null)

    // Act
    const result = await deleteChartScore(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if scores does not contain user score', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce({
      ...user,
      id: 'other_user',
    })

    // Act
    const result = await deleteChartScore(null, req, [score])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "204 No Content" if scores coitains user score', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValue(user)

    // Act
    const result = await deleteChartScore(null, req, [score])

    // Assert
    expect(result.httpResponse.status).toBe(204)
    expect(result.documents).toStrictEqual([{ ...score, ttl: 3600 }])
  })
})
