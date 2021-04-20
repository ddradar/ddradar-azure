import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import {
  areaHiddenUser,
  privateUser,
  publicUser,
  testScores,
  testSongData,
} from '@ddradar/core/__tests__/data'
import { fetchScore } from '@ddradar/db'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import postSongScores from '.'

jest.mock('../auth')
jest.mock('@ddradar/db')

describe('POST /api/v1/scores', () => {
  const req: Pick<HttpRequest, 'headers' | 'body'> = { headers: {}, body: {} }
  const song = { ...testSongData, isCourse: false }

  const scores = new Map(testScores.map(d => [d.userId, d]))

  const score: Api.ScoreBody = {
    score: 1000000,
    clearLamp: 7,
    maxCombo: 138,
    rank: 'AAA',
    exScore: 414,
  }
  const radar = { stream: 29, voltage: 22, air: 5, freeze: 0, chaos: 0 }

  beforeAll(async () => {
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userId: 'some_user',
      userDetails: 'some_user',
      userRoles: ['anonymous', 'authenticated'],
    })
    mocked(fetchScore).mockImplementation(
      (userId, _1, playStyle, difficulty) => {
        if (playStyle !== 1 || difficulty !== 0) return Promise.resolve(null)
        return Promise.resolve(scores.get(userId) ?? null)
      }
    )
  })

  beforeEach(() => (req.body = {}))

  test('returns "401 Unauthenticated" if no authentication', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(401)
  })

  test.each([
    undefined,
    [],
    [{ score: 50000000 }],
    [{ ...score }],
    [{ ...score, playStyle: 'SINGLE', difficulty: 'BEGINNER' }],
    [{ ...score, playStyle: 1, difficulty: 5 }],
    [{ ...score, playStyle: 3, difficulty: 0 }],
  ])('returns "400 Bad Request" if body is %p', async body => {
    // Arrange
    req.body = body

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    req.body = [{ ...score, playStyle: 1, difficulty: 0 }]

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if songs is empty', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    req.body = [{ playStyle: 1, difficulty: 0, ...score }]

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test.each([
    [2, 0],
    [1, 4],
  ])(
    `/${song.id} returns "404 Not Found" if body is [{ playStyle: %i, difficulty: %i }]`,
    async (playStyle, difficulty) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      req.body = [{ ...score, playStyle, difficulty }]

      // Act
      const result = await postSongScores(null, req, [song])

      // Assert
      expect(result.httpResponse.status).toBe(404)
    }
  )

  test(`/${song.id} returns "400 Bad Request" if body is invalid Score`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    req.body = [
      {
        playStyle: 1,
        difficulty: 0,
        score: 90000,
        clearLamp: 2,
        rank: 'E',
        exScore: 1000,
      },
    ]

    // Act
    const result = await postSongScores(null, req, [song])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test(`inserts World & Area Top`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    const expected = {
      playStyle: 1,
      difficulty: 1,
      level: 8,
      score: 999700,
      clearLamp: 6,
      rank: 'AAA',
      maxCombo: 264,
      exScore: 762,
    }
    req.body = [{ ...expected }]

    // Act
    const result = await postSongScores(null, req, [song])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual([
      {
        ...scores.get(publicUser.id),
        ...expected,
        radar: { stream: 55, voltage: 44, air: 18, freeze: 0, chaos: 4 },
      },
    ])
    expect(result.documents?.[1].score).toBe(expected.score)
    expect(result.documents?.[2].score).toBe(expected.score)
  })

  test.each([
    [950000, 2],
    [999510, 6],
    [1000000, 7],
  ])(
    'inserts { score: %i, clearLamp: %i } for world top',
    async (topScore, clearLamp) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      const expected = {
        playStyle: 1,
        difficulty: 1,
        level: 8,
        score: 900000,
        clearLamp: 4,
        rank: 'AA',
        maxCombo: 264,
        exScore: 700,
      }
      req.body = [{ ...expected, topScore }]

      // Act
      const result = await postSongScores(null, req, [song])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.documents?.[1].score).toBe(topScore)
      expect(result.documents?.[1].clearLamp).toBe(clearLamp)
    }
  )

  test.each([
    [
      0,
      {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        score: 890000,
        clearLamp: 4,
        rank: 'AA-',
        exScore: 200,
        maxCombo: 138,
      },
      { ...radar, stream: 25 },
    ],
    [
      4,
      {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        score: 999620,
        clearLamp: 6,
        rank: 'AAA',
        exScore: 376,
      },
      { ...radar, stream: 28 },
    ],
  ])(
    `/${song.id} returns "200 OK" with JSON and documents[%i] if score is %p`,
    async (length, score, radar) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      req.body = [{ ...score }]

      // Act
      const result = await postSongScores(null, req, [song])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual([
        {
          ...scores.get(publicUser.id),
          ...score,
          radar,
        },
      ])
      expect(result.documents).toHaveLength(length)
    }
  )

  test.each([
    [2, privateUser],
    [4, areaHiddenUser],
    [6, publicUser],
  ])(
    `/${song.id} returns "200 OK" with JSON and documents[%i] if user is %p and score is MFC`,
    async (length, user) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(user)
      const expected = {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        ...score,
      }
      req.body = [{ ...expected }]

      // Act
      const result = await postSongScores(null, req, [song])

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual([
        { ...scores.get(user.id), ...expected, radar },
      ])
      expect(result.documents).toHaveLength(length)
    }
  )

  test(`/${song.id} returns "200 OK" with JSON and documents[%i] if course`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    const expected = {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      ...score,
    }
    req.body = [{ ...expected }]

    // Act
    const result = await postSongScores(null, req, [
      { ...song, isCourse: true },
    ])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual([
      { ...scores.get(privateUser.id), ...expected },
    ])
  })

  test(`/${song.id} updates World Top if topScore is defined`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    const expected = {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      ...score,
    }
    req.body = [{ ...expected, topScore: 999700 }]

    // Act
    const result = await postSongScores(null, req, [song])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual([
      {
        ...scores.get(privateUser.id),
        ...expected,
        radar,
      },
    ])
    expect(result.documents).toHaveLength(4)
  })
})
