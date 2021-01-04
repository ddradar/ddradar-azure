import type { Context, HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import {
  areaHiddenUser,
  privateUser,
  publicUser,
  testSongData,
} from '../core/__tests__/data'
import type { ScoreSchema } from '../core/db/scores'
import postChartScore from '.'

jest.mock('../auth')

describe('POST /api/v1/scores', () => {
  let context: Pick<Context, 'bindingData'>
  let req: Pick<HttpRequest, 'headers' | 'body'>
  const song = { ...testSongData, isCourse: false }
  const mfcScore = { score: 1000000, rank: 'AAA', clearLamp: 7 }
  const radar = { stream: 29, voltage: 22, air: 5, freeze: 0, chaos: 0 }

  beforeAll(() =>
    mocked(getClientPrincipal).mockReturnValue({
      userId: 'some_user',
      identityProvider: 'github',
      userDetails: 'github_account',
      userRoles: ['anonymous', 'authenticated'],
    })
  )
  beforeEach(() => {
    context = { bindingData: {} }
    req = { headers: {} }
  })

  test('returns "401 Unauthenticated" if no authentication', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(401)
  })

  test('returns "400 Bad Request" if body is not Score', async () => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = {}

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = mfcScore

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if songs is empty', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.songId = '00000000000000000000000000000000'
    context.bindingData.playStyle = 1
    context.bindingData.difficulty = 0
    req.body = mfcScore

    // Act
    const result = await postChartScore(context, req, [], [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test.each([
    [song.id, 2, 0],
    [song.id, 1, 4],
  ])(
    '/%s/%i/%i returns "404 Not Found"',
    async (songId, playStyle, difficulty) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.songId = songId
      context.bindingData.playStyle = playStyle
      context.bindingData.difficulty = difficulty
      req.body = mfcScore

      // Act
      const result = await postChartScore(context, req, [song], [])

      // Assert
      expect(result.httpResponse.status).toBe(404)
    }
  )

  test('returns "400 Bad Request" if body is invalid Score', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.songId = song.id
    context.bindingData.playStyle = song.charts[0].playStyle
    context.bindingData.difficulty = song.charts[0].difficulty
    req.body = { score: 90000, clearLamp: 2, rank: 'E', exScore: 1000 }

    // Act
    const result = await postChartScore(context, req, [song], [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  const score = {
    songId: song.id,
    songName: song.name,
    playStyle: song.charts[0].playStyle,
    difficulty: song.charts[0].difficulty,
    level: song.charts[0].level,
    score: 970630, // P:28, Gr:10
    clearLamp: 5,
    rank: 'AA+',
    maxCombo: 138,
    exScore: 366,
  } as const
  const scores: ScoreSchema[] = [
    {
      ...score,
      userId: '0',
      userName: '0',
      isPublic: false,
      score: 999620, // P:38
      clearLamp: 6,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 376,
    },
    {
      ...score,
      userId: '13',
      userName: '13',
      isPublic: false,
      score: 996720, // P:37, Gr:1
      clearLamp: 5,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 375,
    },
    {
      ...score,
      userId: publicUser.id,
      userName: publicUser.name,
      isPublic: publicUser.isPublic,
    },
    {
      ...score,
      userId: areaHiddenUser.id,
      userName: areaHiddenUser.name,
      isPublic: areaHiddenUser.isPublic,
    },
    {
      ...score,
      userId: privateUser.id,
      userName: privateUser.name,
      isPublic: privateUser.isPublic,
    },
  ]

  test(`/${song.id}/1/1 inserts World & Area Top`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
    context.bindingData.songId = song.id
    context.bindingData.playStyle = song.charts[1].playStyle
    context.bindingData.difficulty = song.charts[1].difficulty
    req.body = { score: 900000, clearLamp: 3, rank: 'AA' }

    // Act
    const result = await postChartScore(context, req, [song], [])

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...req.body,
      userId: publicUser.id,
      userName: publicUser.name,
      isPublic: publicUser.isPublic,
      songId: song.id,
      songName: song.name,
      playStyle: song.charts[1].playStyle,
      difficulty: song.charts[1].difficulty,
      level: song.charts[1].level,
      radar: { stream: 50, voltage: 0, air: 17, freeze: 0, chaos: 3 },
    })
    expect(result.documents).toHaveLength(3)
  })

  test.each([
    [
      2,
      { score: 890000, clearLamp: 4, rank: 'AA-', exScore: 200, maxCombo: 138 },
      { ...radar, stream: 25 },
    ],
    [
      4,
      { score: 999620, clearLamp: 6, rank: 'AAA', exScore: 376, maxCombo: 138 },
      { ...radar, stream: 28 },
    ],
    [6, { ...mfcScore, maxCombo: 138, exScore: 414 }, radar],
  ])(
    `/${song.id}/1/0 returns "200 OK" with JSON and documents[%i] if body is %p`,
    async (length, score, radar) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = song.charts[0].playStyle
      context.bindingData.difficulty = song.charts[0].difficulty
      req.body = score

      // Act
      const result = await postChartScore(context, req, [song], scores)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...scores[2],
        ...score,
        radar,
      })
      expect(result.documents).toHaveLength(length)
    }
  )

  test.each([
    [2, privateUser],
    [4, areaHiddenUser],
    [6, publicUser],
  ])(
    `/${song.id}/1/0 returns "200 OK" with JSON and documents[%i] if user is %p`,
    async (length, user) => {
      // Arrange
      mocked(getLoginUserInfo).mockResolvedValueOnce(user)
      context.bindingData.songId = song.id
      context.bindingData.playStyle = song.charts[0].playStyle
      context.bindingData.difficulty = song.charts[0].difficulty
      req.body = mfcScore

      // Act
      const result = await postChartScore(context, req, [song], scores)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual({
        ...score,
        userId: user.id,
        userName: user.name,
        isPublic: user.isPublic,
        ...mfcScore,
        maxCombo: 138,
        exScore: 414,
        radar,
      })
      expect(result.documents).toHaveLength(length)
    }
  )

  test(`/${song.id}/1/0 returns "200 OK" with JSON and documents[%i] if course`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    context.bindingData.songId = song.id
    context.bindingData.playStyle = song.charts[0].playStyle
    context.bindingData.difficulty = song.charts[0].difficulty
    req.body = mfcScore

    // Act
    const result = await postChartScore(
      context,
      req,
      [{ ...song, isCourse: true }],
      scores
    )

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual({
      ...score,
      userId: privateUser.id,
      userName: privateUser.name,
      isPublic: privateUser.isPublic,
      ...mfcScore,
      maxCombo: 138,
      exScore: 414,
    })
    expect(result.documents).toHaveLength(2)
  })
})