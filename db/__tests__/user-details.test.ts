import type { Database } from '@ddradar/core'
import { mocked } from 'ts-jest/utils'

import { fetchGroupedList, fetchList } from '../database'
import { fetchClearAndScoreStatus, generateGrooveRadar } from '../user-details'

jest.mock('../database')

describe('user-details.ts', () => {
  describe('generateGrooveRadar()', () => {
    const radar: Database.GrooveRadarSchema = {
      userId: 'public_user',
      type: 'radar',
      playStyle: 1,
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    }
    beforeEach(() => mocked(fetchGroupedList).mockClear())

    test('returns groove radar', async () => {
      // Arrange
      mocked(fetchGroupedList).mockResolvedValue([{ ...radar }])

      // Act
      const result = await generateGrooveRadar('public_user', 1)

      // Assert
      expect(result).toStrictEqual({ ...radar, id: 'radar-public_user-1' })
      expect(mocked(fetchGroupedList)).toBeCalled()
    })

    test('returns empty groove radar if scores is empty', async () => {
      // Arrange
      mocked(fetchGroupedList).mockResolvedValue([])

      // Act
      const result = await generateGrooveRadar('public_user', 1)
      const emptyRadar = { stream: 0, voltage: 0, air: 0, freeze: 0, chaos: 0 }

      expect(result).toStrictEqual({
        ...radar,
        ...emptyRadar,
        id: 'radar-public_user-1',
      })
      expect(mocked(fetchGroupedList)).toBeCalled()
    })
  })

  describe('fetchClearAndScoreStatus()', () => {
    test('calls fetchList("*")', async () => {
      // Arrange
      mocked(fetchList).mockResolvedValue([])

      // Act
      const result = await fetchClearAndScoreStatus('foo')

      // Assert
      expect(result).toHaveLength(0)
      expect(mocked(fetchList)).toBeCalled()
    })
  })
})
