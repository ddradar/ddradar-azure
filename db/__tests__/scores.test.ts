import type { Container, ItemDefinition } from '@azure/cosmos'
import type { Database, Score } from '@ddradar/core'
import { mocked } from 'ts-jest/utils'

import { fetchOne, getContainer } from '..'
import {
  fetchScore,
  fetchSummeryClearLampCount,
  fetchSummeryRankCount,
} from '../scores'

jest.mock('..')

describe('scores.ts', () => {
  describe('fetchScore', () => {
    beforeEach(() => mocked(fetchOne).mockClear())

    test('returns fetchOne() value', async () => {
      // Arrange
      const resource: Database.ScoreSchema & ItemDefinition = {
        id: 'foo',
        songId: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
        songName: 'PARANOiA',
        playStyle: 1,
        difficulty: 0,
        level: 4,
        userId: 'foo',
        userName: 'foo',
        isPublic: true,
        score: 1000000,
        clearLamp: 7,
        rank: 'AAA',
      }
      mocked(fetchOne).mockResolvedValue(resource)

      // Act
      const result = await fetchScore('foo', '', 1, 0)

      // Assert
      expect(result).toBe(resource)
      expect(mocked(fetchOne)).toBeCalled()
    })
  })
  describe('fetchSummeryClearLampCount', () => {
    let resources: Database.ClearStatusSchema[] = []
    const container = {
      items: {
        query: jest.fn(() => ({ fetchAll: async () => ({ resources }) })),
      },
    }
    beforeAll(() =>
      mocked(getContainer).mockReturnValue(container as unknown as Container)
    )
    beforeEach(() => {
      container.items.query.mockClear()
      resources = []
    })
    test('returns ClearStatusSchema[]', async () => {
      // Arrange
      const length = 19 * 8
      resources.push(
        ...[...Array(length).keys()].map(i => ({
          userId: 'foo',
          type: 'clear' as const,
          playStyle: ((i % 2) + 1) as 1 | 2,
          level: (i % 19) + 1,
          clearLamp: (i % 8) as Score.ClearLamp,
          count: 10,
        }))
      )

      // Act
      const result = await fetchSummeryClearLampCount()

      // Assert
      expect(result).toHaveLength(length)
    })
  })
  describe('fetchSummeryRankCount', () => {
    let resources: Database.ScoreStatusSchema[] = []
    const container = {
      items: {
        query: jest.fn(() => ({ fetchAll: async () => ({ resources }) })),
      },
    }
    beforeAll(() =>
      mocked(getContainer).mockReturnValue(container as unknown as Container)
    )
    beforeEach(() => {
      container.items.query.mockClear()
      resources = []
    })
    test('returns ClearStatusSchema[]', async () => {
      // Arrange
      const length = 19 * 8
      resources.push(
        ...[...Array(length).keys()].map(i => ({
          userId: 'foo',
          type: 'score' as const,
          playStyle: ((i % 2) + 1) as 1 | 2,
          level: (i % 19) + 1,
          rank: 'AA' as const,
          count: 10,
        }))
      )

      // Act
      const result = await fetchSummeryRankCount()

      // Assert
      expect(result).toHaveLength(length)
    })
  })
})
