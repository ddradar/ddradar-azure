import type { Container, ItemDefinition } from '@azure/cosmos'
import type { Database } from '@ddradar/core'
import { testSongData } from '@ddradar/core/__tests__/data'
import { fetchTotalChartCount, getContainer } from '@ddradar/db'
import { mocked } from 'ts-jest/utils'

import updateScores from '.'

jest.mock('@ddradar/db')

describe('/updateScoresSongInfo/index.ts', () => {
  const song = { ...testSongData, skillAttackId: 1 }
  const oldCounts = [...Array(19 * 2).keys()].map(i => ({
    id: `id-${i}`, // id-0, id-1, ..., id-37
    playStyle: ((i % 2) + 1) as 1 | 2,
    level: (i % 19) + 1, // 1-19
    count: 1000,
  }))
  const newCounts = oldCounts.map(d => ({
    ...d,
    count: 2000,
  }))

  const context = {
    log: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  }
  let resources: Database.ScoreSchema[] = []
  const container = {
    items: {
      query: () => ({
        fetchAll: async () => ({ resources }),
      }),
    },
  }
  beforeAll(() => {
    mocked(getContainer).mockReturnValue((container as unknown) as Container)
    mocked(fetchTotalChartCount).mockResolvedValue(newCounts)
  })
  beforeEach(() => {
    context.log.info.mockClear()
    context.log.warn.mockClear()
    context.log.error.mockClear()
    resources = []
  })
  const validScore: Database.ScoreSchema & ItemDefinition = {
    id: `user1-${song.name}-${song.charts[0].playStyle}-${song.charts[0].difficulty}`,
    userId: 'user1',
    userName: 'User 1',
    isPublic: true,
    songId: song.id,
    songName: song.name,
    playStyle: song.charts[0].playStyle,
    difficulty: song.charts[0].difficulty,
    level: song.charts[0].level,
    clearLamp: 6,
    score: 999960,
    rank: 'AAA',
  }
  const worldScore = {
    ...validScore,
    id: '0',
    userId: '0',
    userName: '0',
    isPublic: false,
  }
  const emptyScore: Database.ScoreSchema = {
    clearLamp: 0,
    isPublic: false,
    rank: 'E',
    score: 0,
    userId: '0',
    userName: '0',
    songId: song.id,
    songName: song.name,
    playStyle: song.charts[1].playStyle,
    difficulty: song.charts[1].difficulty,
    level: song.charts[1].level,
  }

  test('returns { scores: [] } if songs is empty', async () => {
    // Arrange - Act
    const result = await updateScores(context, [], oldCounts)

    // Assert
    expect(result).toStrictEqual({ scores: [], details: newCounts })
  })

  test('returns { scores: [emptyScore] } with log.info if scores is empty', async () => {
    // Arrange - Act
    const result = await updateScores(context, [song], [])

    // Assert
    expect(result).toStrictEqual({
      scores: [
        {
          ...emptyScore,
          difficulty: song.charts[0].difficulty,
          level: song.charts[0].level,
        },
        emptyScore,
      ],
      details: newCounts.map(d => ({ ...d, id: undefined })),
    })
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns  { scores: [emptyScore] } with log.info no need to update Scores', async () => {
    // Arrange
    resources = [validScore, worldScore]

    // Act
    const result = await updateScores(context, [song], oldCounts)

    // Assert
    expect(result).toStrictEqual({ scores: [emptyScore], details: newCounts })
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns  { scores: [emptyScore] } with log.warn if maxCombo is invalid', async () => {
    // Arrange
    resources = [{ ...validScore, maxCombo: 3 }, worldScore]

    // Act
    const result = await updateScores(context, [song], oldCounts)

    // Assert
    expect(result).toStrictEqual({ scores: [emptyScore], details: newCounts })
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test('returns [emptyScore] with error if invalid Scores', async () => {
    // Arrange
    const score = { ...validScore, playStyle: 2, difficulty: 0 } as const
    resources = [score, worldScore]

    // Act
    const result = await updateScores(context, [song], oldCounts)

    // Assert
    expect(result).toStrictEqual({ scores: [emptyScore], details: newCounts })
    expect(context.log.error).toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })

  test.each([
    { ...validScore, songName: 'foo' },
    { ...validScore, level: 10 },
  ])('returns [score] if Scores info has diff', async score => {
    // Arrange
    resources = [score, worldScore]

    // Act
    const result = await updateScores(context, [song], oldCounts)

    // Assert
    expect(result).toStrictEqual({
      scores: [validScore, emptyScore],
      details: newCounts,
    })
    expect(context.log.error).not.toBeCalled()
    expect(context.log.warn).not.toBeCalled()
    expect(context.log.info).toBeCalled()
  })
})
