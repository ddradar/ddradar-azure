import type { ItemDefinition } from '@azure/cosmos'
import type { Database, Score } from '@ddradar/core'
import { mocked } from 'ts-jest/utils'

import { fetchGroupedList, fetchList, fetchOne } from '../database'
import {
  fetchScore,
  fetchScoreList,
  fetchSummaryClearLampCount,
  fetchSummaryRankCount,
} from '../scores'

jest.mock('../database')

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mocked(fetchOne).mockResolvedValue(resource as any)

      // Act
      const result = await fetchScore('foo', '', 1, 0)

      // Assert
      expect(result).toBe(resource)
      expect(mocked(fetchOne)).toBeCalledWith(
        'Scores',
        [
          'id',
          'userId',
          'userName',
          'isPublic',
          'songId',
          'songName',
          'playStyle',
          'difficulty',
          'level',
          'clearLamp',
          'score',
          'rank',
          'exScore',
          'maxCombo',
          'radar',
        ],
        { condition: 'c.userId = @', value: 'foo' },
        { condition: 'c.songId = @', value: '' },
        { condition: 'c.playStyle = @', value: 1 },
        { condition: 'c.difficulty = @', value: 0 },
        { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' }
      )
    })
  })
  describe('fetchScoreList', () => {
    beforeEach(() => mocked(fetchList).mockClear())

    test('("foo") calls fetchList("Scores", columns, condition, { songName: "ASC" })', async () => {
      // Arrange
      const resources: Omit<
        Database.ScoreSchema,
        'userId' | 'userName' | 'isPublic'
      >[] = []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mocked(fetchList).mockResolvedValue(resources as any)

      // Act
      const result = await fetchScoreList('foo')

      // Assert
      expect(result).toBe(resources)
      expect(mocked(fetchList)).toBeCalledWith(
        'Scores',
        [
          'songId',
          'songName',
          'playStyle',
          'difficulty',
          'level',
          'score',
          'exScore',
          'maxCombo',
          'clearLamp',
          'rank',
          'radar',
          'deleted',
        ],
        [
          { condition: 'c.userId = @', value: 'foo' },
          {
            condition:
              '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)',
          },
          { condition: 'IS_DEFINED(c.radar)' },
        ],
        { songName: 'ASC' }
      )
    })
    test.each([
      [{}, true, []],
      [
        {
          playStyle: 1,
          difficulty: 0,
          level: 3,
          clearLamp: 4,
          rank: 'AAA',
        } as const,
        false,
        [
          { condition: 'c.playStyle = @', value: 1 },
          { condition: 'c.difficulty = @', value: 0 },
          { condition: 'c.level = @', value: 3 },
          { condition: 'c.clearLamp = @', value: 4 },
          { condition: 'c.rank = @', value: 'AAA' },
          { condition: 'IS_DEFINED(c.radar)' },
        ],
      ],
    ])(
      '("foo", %p, %p) calls fetchList("Scores", columns, %p, { songName: "ASC" })',
      async (conditions, includeCourse, additionalConditions) => {
        // Arrange
        const resources: Omit<
          Database.ScoreSchema,
          'userId' | 'userName' | 'isPublic'
        >[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mocked(fetchList).mockResolvedValue(resources as any)

        // Act
        const result = await fetchScoreList('foo', conditions, includeCourse)

        // Assert
        expect(result).toBe(resources)
        expect(mocked(fetchList)).toBeCalledWith(
          'Scores',
          [
            'songId',
            'songName',
            'playStyle',
            'difficulty',
            'level',
            'score',
            'exScore',
            'maxCombo',
            'clearLamp',
            'rank',
            'radar',
            'deleted',
          ],
          [
            { condition: 'c.userId = @', value: 'foo' },
            {
              condition:
                '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)',
            },
            ...additionalConditions,
          ],
          { songName: 'ASC' }
        )
      }
    )
  })
  describe('fetchSummaryClearLampCount', () => {
    test('returns ClearStatusSchema[]', async () => {
      // Arrange
      const clearCounts = [...Array(19 * 8).keys()].map(i => ({
        userId: 'foo',
        type: 'clear' as const,
        playStyle: ((i % 2) + 1) as 1 | 2,
        level: (i % 19) + 1,
        clearLamp: (i % 8) as Score.ClearLamp,
        count: 10,
      }))
      mocked(fetchGroupedList).mockResolvedValue(clearCounts)

      // Act
      const result = await fetchSummaryClearLampCount()

      // Assert
      expect(result).toBe(clearCounts)
      expect(mocked(fetchGroupedList)).toBeCalled()
    })
  })

  describe('fetchSummaryRankCount()', () => {
    test('returns ScoreStatusSchema[]', async () => {
      // Arrange
      const rankCounts = [...Array(19 * 2).keys()].map(i => ({
        userId: 'foo',
        type: 'score' as const,
        playStyle: ((i % 2) + 1) as 1 | 2,
        level: (i % 19) + 1,
        rank: 'AA' as const,
        count: 10,
      }))
      mocked(fetchGroupedList).mockResolvedValue(rankCounts)

      // Act
      const result = await fetchSummaryRankCount()

      // Assert
      expect(result).toBe(rankCounts)
      expect(mocked(fetchGroupedList)).toBeCalled()
    })
  })
})
