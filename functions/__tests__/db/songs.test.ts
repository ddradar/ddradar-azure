import type { Container } from '@azure/cosmos'
import type { ClearStatusSchema } from '@ddradar/core/db/userDetails'
import { mocked } from 'ts-jest/utils'

import { getContainer } from '../../db'
import { fetchTotalChartCount } from '../../db/songs'

jest.mock('../../db')

describe('/db/user-details.ts', () => {
  describe('fetchTotalChartCount()', () => {
    let resources: Pick<
      ClearStatusSchema,
      'level' | 'playStyle' | 'count'
    >[] = []
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
      const result = await fetchTotalChartCount()

      // Assert
      expect(result).toHaveLength(0)
      expect(container.items.query).toBeCalledWith({
        query:
          'SELECT c.playStyle, c.level, COUNT(1) AS count ' +
          'FROM s JOIN c IN s.charts ' +
          'WHERE s.nameIndex != -1 AND s.nameIndex != -2 ' +
          'GROUP BY c.playStyle, c.level',
      })
    })
  })
})