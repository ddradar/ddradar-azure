import type { Context, HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { describeIf } from '../__tests__/util'
import { ClientPrincipal, getClientPrincipal, getLoginUserInfo } from '../auth'
import { canConnectDB, getContainer, ScoreSchema, SongSchema } from '../db'
import { Score } from '../score'
import postSongScores from '.'

jest.mock('../auth')

describe('POST /api/v1/scores', () => {
  let context: Pick<Context, 'bindingData'>
  let req: Pick<HttpRequest, 'headers' | 'body'>
  const song: SongSchema & { skillAttackId: number } = {
    id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    skillAttackId: 1,
    name: 'PARANOiA',
    nameKana: 'PARANOIA',
    nameIndex: 25,
    artist: '180',
    series: 'DDR 1st',
    minBPM: 180,
    maxBPM: 180,
    charts: [
      {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        notes: 138,
        freezeArrow: 0,
        shockArrow: 0,
        stream: 29,
        voltage: 22,
        air: 5,
        freeze: 0,
        chaos: 0,
      },
      {
        playStyle: 1,
        difficulty: 1,
        level: 8,
        notes: 264,
        freezeArrow: 0,
        shockArrow: 0,
        stream: 56,
        voltage: 44,
        air: 18,
        freeze: 0,
        chaos: 4,
      },
    ],
  }

  beforeEach(() => {
    context = { bindingData: {} }
    req = { headers: {} }
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userId: 'some_user',
      userDetails: 'some_user',
      userRoles: ['anonymous', 'authenticated'],
    })
  })

  test('returns "401 Unauthenticated" if no authentication', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce(null)

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(401)
  })

  const score: Score = {
    score: 1000000,
    clearLamp: 7,
    maxCombo: 200,
    rank: 'AAA',
  }
  test.each([
    undefined,
    null,
    1000000,
    '',
    true,
    {},
    [],
    [{ score: 50000000 }],
    [{ ...score }],
    [{ ...score, playStyle: 'SINGLE', difficulty: 'BEGINNER' }],
    [{ ...score, playStyle: 1, difficulty: 5 }],
    [{ ...score, playStyle: 3, difficulty: 0 }],
  ])('returns "400 Bad Request" if body is %p', async body => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    req.body = body

    // Act
    const result = await postSongScores(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    context.bindingData.songId = '00000000000000000000000000000000'
    req.body = [{ ...score, playStyle: 1, difficulty: 0 }]

    // Act
    const result = await postSongScores(context, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  describeIf(canConnectDB)('Cosmos DB integration test', () => {
    const scoreContainer = getContainer('Scores')
    const publicUser = {
      id: 'public_user',
      loginId: 'public_user',
      name: 'AFRO',
      area: 13,
      isPublic: true,
    } as const
    const areaHiddenUser = {
      id: 'area_hidden_user',
      loginId: 'area_hidden_user',
      name: 'ZERO',
      area: 0,
      isPublic: true,
    } as const
    const privateUser = {
      id: 'private_user',
      loginId: 'private_user',
      name: 'EMI',
      area: 13,
      isPublic: false,
    } as const
    const worldScore: ScoreSchema = {
      userId: '0',
      userName: '0',
      songId: song.id,
      songName: song.name,
      playStyle: song.charts[0].playStyle,
      difficulty: song.charts[0].difficulty,
      level: song.charts[0].level,
      score: 999620, // P:38
      clearLamp: 6,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 376,
      isPublic: false,
    }
    const areaScore: ScoreSchema = {
      ...worldScore,
      userId: '13',
      userName: '13',
      score: 996720, // P:37, Gr:1
      clearLamp: 5,
      rank: 'AAA',
      maxCombo: 138,
      exScore: 375,
    }
    const publicUserScore: ScoreSchema = {
      ...worldScore,
      userId: publicUser.id,
      userName: publicUser.name,
      score: 970630, // P:28, Gr:10
      clearLamp: 5,
      rank: 'AA+',
      maxCombo: 138,
      exScore: 366,
      isPublic: publicUser.isPublic,
    }
    const areaHiddenUserScore: ScoreSchema = {
      ...publicUserScore,
      userId: areaHiddenUser.id,
      userName: areaHiddenUser.name,
      isPublic: areaHiddenUser.isPublic,
    }
    const privateUserScore: ScoreSchema = {
      ...publicUserScore,
      userId: privateUser.id,
      userName: privateUser.name,
      isPublic: privateUser.isPublic,
    }
    const clientPrincipal: Pick<
      ClientPrincipal,
      'identityProvider' | 'userRoles' | 'userDetails'
    > = {
      identityProvider: 'github',
      userDetails: 'github_account',
      userRoles: ['anonymous', 'authenticated'],
    }
    const addId = (s: ScoreSchema) => ({
      ...s,
      id: `${s.userId}-${s.songId}-${s.playStyle}-${s.difficulty}`,
    })

    beforeEach(async () => {
      await Promise.all(
        [
          addId(worldScore),
          addId(areaScore),
          addId(publicUserScore),
          addId(areaHiddenUserScore),
          addId(privateUserScore),
        ].map(s => scoreContainer.items.create(s))
      )
    })
    afterEach(async () => {
      await Promise.all(
        [
          addId(worldScore),
          addId(areaScore),
          addId(publicUserScore),
          addId(areaHiddenUserScore),
          addId(privateUserScore),
        ].map(s => scoreContainer.item(s.id, s.userId).delete())
      )
    })

    test.each(['00000000000000000000000000000000', '999', {}])(
      '/%s returns "404 Not Found"',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = songId
        req.body = [{ playStyle: 1, difficulty: 0, ...score }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(404)
      }
    )

    test.each([
      [2, 0],
      [1, 4],
    ])(
      `/${song.id} returns "404 Not Found" if body is [{ playStyle: %i, difficulty: %i }]`,
      async (playStyle, difficulty) => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = song.id
        req.body = [{ playStyle, difficulty, ...score }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(404)
      }
    )

    test.each([
      [2, 0],
      [1, 4],
    ])(
      `/${song.skillAttackId} returns "404 Not Found" if body is [{ playStyle: %i, difficulty: %i }]`,
      async (playStyle, difficulty) => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = `${song.skillAttackId}`
        req.body = [{ playStyle, difficulty, ...score }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(404)
      }
    )

    test.each([song.id, `${song.skillAttackId}`])(
      '/%s returns "400 Bad Request" if body is invalid Score',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = songId
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
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(400)
      }
    )

    test.each([song.id, `${song.skillAttackId}`])(
      '/%s inserts World & Area Top',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = songId
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
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual([
          {
            ...publicUserScore,
            ...expected,
          },
        ])
        expect(result.documents?.[1].score).toBe(expected.score)
        expect(result.documents?.[2].score).toBe(expected.score)
      }
    )

    test.each([
      [950000, 2],
      [999510, 6],
      [1000000, 7],
    ])(
      'inserts { score: %i, clearLamp: %i } for world top',
      async (topScore, clearLamp) => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = song.id
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
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual([
          {
            ...publicUserScore,
            ...expected,
          },
        ])
        expect(result.documents?.[1].score).toBe(topScore)
        expect(result.documents?.[1].clearLamp).toBe(clearLamp)
        expect(result.documents?.[2].score).toBe(expected.score)
      }
    )

    test.each([song.id, `${song.skillAttackId}`])(
      '/%s does not update if score is less than old one',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = songId
        const expected = {
          playStyle: 1,
          difficulty: 0,
          level: 4,
          score: 890000,
          clearLamp: 4,
          rank: 'AA-',
          exScore: 200,
          maxCombo: 138,
        }
        req.body = [{ ...expected }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual([
          {
            ...publicUserScore,
            ...expected,
          },
        ])
        expect(result.documents).toHaveLength(0)
      }
    )

    test.each([song.id, `${song.skillAttackId}`])(
      '/% updates Area Top if user is public and score is greater than it',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = songId
        const expected = {
          playStyle: 1,
          difficulty: 0,
          level: 4,
          score: 999620,
          clearLamp: 6,
          rank: 'AAA',
          exScore: 376,
        }
        req.body = [{ ...expected }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual([
          {
            ...publicUserScore,
            ...expected,
          },
        ])
        expect(result.documents?.[1]?.score).toBe(expected.score)
      }
    )

    test.each([song.id, `${song.skillAttackId}`])(
      '/%s updates World & Area Top if user is public and score is greater than them',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: publicUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(publicUser)
        context.bindingData.songId = songId
        const expected = {
          playStyle: 1,
          difficulty: 0,
          level: 4,
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 414,
        }
        req.body = [{ ...expected }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual([
          {
            ...publicUserScore,
            ...expected,
          },
        ])
        expect(result.documents?.[1].score).toBe(expected.score)
        expect(result.documents?.[2].score).toBe(expected.score)
      }
    )

    test.each([song.id, `${song.skillAttackId}`])(
      '/%s updates World Top if user is public and area is 0',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: areaHiddenUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(areaHiddenUser)
        context.bindingData.songId = songId
        const expected = {
          playStyle: 1,
          difficulty: 0,
          level: 4,
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 414,
        }
        req.body = [{ ...expected }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual([
          {
            ...areaHiddenUserScore,
            ...expected,
          },
        ])
        expect(result.documents?.[1].score).toBe(expected.score)
      }
    )

    test.each([song.id, `${song.skillAttackId}`])(
      '/%s updates personal best only if user is private',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: privateUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
        context.bindingData.songId = songId
        const expected = {
          playStyle: 1,
          difficulty: 0,
          level: 4,
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 414,
        }
        req.body = [{ ...expected }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual([
          {
            ...privateUserScore,
            ...expected,
          },
        ])
        expect(result.documents).toHaveLength(1)
      }
    )

    test.each([song.id, `${song.skillAttackId}`])(
      '/%s updates World Top if topScore is defined',
      async songId => {
        // Arrange
        mocked(getClientPrincipal).mockReturnValueOnce({
          ...clientPrincipal,
          userId: privateUser.loginId,
        })
        mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
        context.bindingData.songId = songId
        const expected = {
          playStyle: 1,
          difficulty: 0,
          level: 4,
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
          maxCombo: 138,
          exScore: 414,
        }
        req.body = [{ ...expected, topScore: 999700 }]

        // Act
        const result = await postSongScores(context, req, [song])

        // Assert
        expect(result.httpResponse.status).toBe(200)
        expect(result.httpResponse.body).toStrictEqual([
          {
            ...privateUserScore,
            ...expected,
          },
        ])
        expect(result.documents?.[1].score).toBe(999700)
        expect(result.documents?.[1].exScore).toBe(384)
      }
    )
  })
})
