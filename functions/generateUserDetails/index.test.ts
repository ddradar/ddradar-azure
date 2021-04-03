import type { ItemDefinition } from '@azure/cosmos'
import type {
  ClearStatusSchema,
  ScoreStatusSchema,
} from '@ddradar/core/db/userDetails'
import { fetchSummeryClearLampCount, fetchSummeryRankCount } from '@ddradar/db'
import { mocked } from 'ts-jest/utils'

import generateUserDetails from '.'

jest.mock('@ddradar/db')

describe('/generateUserDetails/index.ts', () => {
  const status = {
    userId: 'foo',
    playStyle: 1,
    level: 5,
    count: 20,
  } as const
  const oldClear: ClearStatusSchema & ItemDefinition = {
    ...status,
    id: 'old_clear',
    type: 'clear',
    clearLamp: 6,
  }
  const oldScore: ScoreStatusSchema & ItemDefinition = {
    ...status,
    id: 'old_score',
    type: 'score',
    rank: 'AAA',
  }
  const newClears: ClearStatusSchema[] = [
    {
      ...status,
      type: 'clear',
      clearLamp: 6,
      count: 30,
    },
    {
      ...status,
      type: 'clear',
      clearLamp: 5,
      count: 10,
    },
  ]
  const newScores: ScoreStatusSchema[] = [
    {
      ...status,
      type: 'score',
      rank: 'AAA',
      count: 30,
    },
    {
      ...status,
      type: 'score',
      rank: 'AA+',
      count: 10,
    },
  ]
  beforeAll(() => {
    mocked(fetchSummeryClearLampCount).mockResolvedValue(newClears)
    mocked(fetchSummeryRankCount).mockResolvedValue(newScores)
  })

  test('merges old.id & new data', async () => {
    const deletedClear: ClearStatusSchema & ItemDefinition = {
      ...oldClear,
      id: 'deleted_clear',
      type: 'clear',
      clearLamp: 4,
    }
    const deletedScore: ScoreStatusSchema & ItemDefinition = {
      ...oldScore,
      id: 'deleted_score',
      rank: 'AA',
    }
    // Arrange - Act
    const result = await generateUserDetails(null, null, [
      oldScore,
      oldClear,
      deletedClear,
      deletedScore,
    ])

    // Assert
    expect(result).toHaveLength(6)
    expect(result).toStrictEqual([
      { ...oldClear, count: 30 },
      { ...newClears[1], id: undefined },
      { ...oldScore, count: 30 },
      { ...newScores[1], id: undefined },
      { ...deletedClear, count: 0 },
      { ...deletedScore, count: 0 },
    ])
  })
})
