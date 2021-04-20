import type { Container } from '@azure/cosmos'
import type { Database } from '@ddradar/core'
import { mocked } from 'ts-jest/utils'

import { getContainer } from '..'
import { fetchClearAndScoreStatus, generateGrooveRadar } from '../user-details'

jest.mock('..')

describe('user-details.ts', () => {
  describe('generateGrooveRadar()', () => {
    let resources: Database.GrooveRadarSchema[] = []
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

    const container = {
      items: {
        query: jest.fn(() => ({ fetchAll: async () => ({ resources }) })),
      },
    }
    beforeAll(() =>
      mocked(getContainer).mockReturnValue((container as unknown) as Container)
    )
    beforeEach(() => {
      container.items.query.mockClear()
      resources = []
    })

    test('returns groove radar', async () => {
      // Arrange
      resources.push({ ...radar })

      // Act
      const result = await generateGrooveRadar('public_user', 1)

      // Assert
      expect(result).toStrictEqual({ ...radar, id: 'radar-public_user-1' })
      expect(container.items.query).toBeCalledWith({
        query:
          'SELECT c.userId, "radar" AS type, c.playStyle, ' +
          'MAX(c.radar.stream) AS stream, MAX(c.radar.voltage) AS voltage, MAX(c.radar.air) AS air, MAX(c.radar.freeze) AS freeze, MAX(c.radar.chaos) AS chaos ' +
          'FROM c ' +
          'WHERE c.userId = @id ' +
          'AND c.playStyle = @playStyle ' +
          'AND IS_DEFINED(c.radar) ' +
          'AND ((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null) ' +
          'GROUP BY c.userId, c.playStyle',
        parameters: [
          { name: '@id', value: 'public_user' },
          { name: '@playStyle', value: 1 },
        ],
      })
    })

    test('returns empty groove radar if scores is empty', async () => {
      // Arrange - Act
      const result = await generateGrooveRadar('public_user', 1)
      const emptyRadar = { stream: 0, voltage: 0, air: 0, freeze: 0, chaos: 0 }

      expect(result).toStrictEqual({
        ...radar,
        ...emptyRadar,
        id: 'radar-public_user-1',
      })
      expect(container.items.query).toBeCalled()
    })
  })

  describe('fetchClearAndScoreStatus()', () => {
    let resources: (
      | Database.ClearStatusSchema
      | Database.ScoreStatusSchema
    )[] = []
    const container = {
      items: {
        query: jest.fn(() => ({ fetchAll: async () => ({ resources }) })),
      },
    }
    beforeAll(() =>
      mocked(getContainer).mockReturnValue((container as unknown) as Container)
    )
    beforeEach(() => {
      container.items.query.mockClear()
      resources = []
    })

    test('returns [] ', async () => {
      // Act
      const result = await fetchClearAndScoreStatus('foo')

      // Assert
      expect(result).toHaveLength(0)
      expect(container.items.query).toBeCalledWith({
        query:
          'SELECT * FROM c WHERE c.userId = @id AND c.type = "clear" OR c.type = "score"',
        parameters: [{ name: '@id', value: 'foo' }],
      })
    })
  })
})
