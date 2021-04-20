import type { ItemDefinition } from '@azure/cosmos'
import type { Database } from '@ddradar/core'
import { fetchClearAndScoreStatus, generateGrooveRadar } from '@ddradar/db'
import { mocked } from 'ts-jest/utils'

import summaryUserScores from '.'

jest.mock('@ddradar/db')

describe('/summaryUserScores/index.ts', () => {
  const context = { log: { info: jest.fn() } }
  beforeAll(() =>
    mocked(generateGrooveRadar).mockImplementation((userId, playStyle) =>
      Promise.resolve({ userId, playStyle, ...radar, type: 'radar' })
    )
  )
  beforeEach(() => context.log.info.mockClear())

  const score: Database.ScoreSchema & ItemDefinition = {
    id: 'foo',
    userId: 'foo',
    userName: 'foo',
    isPublic: false,
    songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    songName: 'PARANOiA',
    playStyle: 1,
    difficulty: 1,
    level: 8,
    clearLamp: 7,
    score: 1000000,
    rank: 'AAA',
    exScore: 264 * 3,
    maxCombo: 264,
  }
  const radar = { stream: 56, voltage: 44, air: 18, freeze: 0, chaos: 4 }

  test('returns [] if scores only include Area top', async () => {
    // Arrange
    const areaScores: Database.ScoreSchema[] = [...Array(10).keys()].map(n => ({
      ...score,
      id: `area-${n}`,
      userId: `${n}`,
    }))

    // Act
    const result = await summaryUserScores(context, areaScores)

    // Assert
    expect(result).toHaveLength(0)
    expect(context.log.info).not.toBeCalled()
  })

  test('returns [GrooveRadar(SP), GrooveRadar(DP), ClearStatus, ScoreStatus] if scores include user score', async () => {
    // Arrange
    mocked(fetchClearAndScoreStatus).mockResolvedValueOnce([])
    const userScore: Database.ScoreSchema = { ...score, radar }

    // Act
    const result = await summaryUserScores(context, [userScore])

    // Assert
    expect(result).toHaveLength(4)
    expect(context.log.info).toBeCalledTimes(3)
  })

  test('returns [GrooveRadar(SP), GrooveRadar(DP), ClearStatus(4), ScoreStatus(4), ClearStatus(8), ScoreStatus(8)] if scores include old & new score', async () => {
    // Arrange
    const detail = { userId: 'foo', playStyle: 1, level: 8, count: 1 } as const
    mocked(fetchClearAndScoreStatus).mockResolvedValue([
      { ...detail, type: 'clear', clearLamp: 5 },
      { ...detail, type: 'score', rank: 'AA+' },
      { ...detail, type: 'clear', clearLamp: 7 },
      { ...detail, type: 'score', rank: 'AAA' },
    ])
    const userScores: (Database.ScoreSchema & ItemDefinition)[] = [
      { ...score, radar, clearLamp: 5, score: 980000, rank: 'AA+', ttl: 3600 },
      { ...score, radar, ttl: -1 },
      { ...score, radar, difficulty: 0, level: 4 },
    ]

    // Act
    const result = await summaryUserScores(context, userScores)

    // Assert
    expect(result).toHaveLength(8)
    expect(context.log.info).toBeCalledTimes(3)
  })

  test('returns [GrooveRadar(SP), GrooveRadar(DP)] if scores include only old score', async () => {
    // Arrange
    mocked(fetchClearAndScoreStatus).mockResolvedValueOnce([])
    const userScore = { ...score, radar, ttl: 3600 }

    // Act
    const result = await summaryUserScores(context, [userScore])

    // Assert
    expect(result).toHaveLength(2)
    expect(context.log.info).toBeCalledTimes(1)
  })
})
