import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import type { SongSchema } from '../db'
import searchCharts from '.'

describe('GET /api/charts', () => {
  let context: Context

  beforeEach(() => {
    context = {
      bindingData: {},
    } as Context
  })

  test.each([NaN, 0, 1.5, -1, 100, Infinity, -Infinity])(
    '/%s/1 returns "404 Not Found"',
    async (playStyle: unknown) => {
      // Arrange
      context.bindingData.playStyle = playStyle

      // Act
      await searchCharts(context)

      // Assert
      expect(context.res?.status).toBe(404)
      expect(context.res?.body).toBe(
        `"playStyle" is undefined or invalid value :${playStyle}`
      )
    }
  )
  test.each([NaN, 0, 1.5, -1, 100, Infinity, -Infinity])(
    '/1/%d returns "404 Not Found"',
    async (level: unknown) => {
      // Arrange
      context.bindingData.playStyle = 1
      context.bindingData.level = level

      // Act
      await searchCharts(context)

      // Assert
      expect(context.res?.status).toBe(404)
      expect(context.res?.body).toBe(
        `"level" is undefined or invalid value :${level}`
      )
    }
  )

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const songs: SongSchema[] = [
        {
          id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
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
            {
              playStyle: 1,
              difficulty: 2,
              level: 9,
              notes: 275,
              freezeArrow: 0,
              shockArrow: 0,
              stream: 58,
              voltage: 52,
              air: 49,
              freeze: 0,
              chaos: 6,
            },
            {
              playStyle: 1,
              difficulty: 3,
              level: 11,
              notes: 319,
              freezeArrow: 0,
              shockArrow: 0,
              stream: 67,
              voltage: 52,
              air: 25,
              freeze: 0,
              chaos: 17,
            },
            {
              playStyle: 2,
              difficulty: 1,
              level: 8,
              notes: 254,
              freezeArrow: 0,
              shockArrow: 0,
              stream: 54,
              voltage: 37,
              air: 61,
              freeze: 0,
              chaos: 2,
            },
            {
              playStyle: 2,
              difficulty: 2,
              level: 13,
              notes: 309,
              freezeArrow: 0,
              shockArrow: 0,
              stream: 65,
              voltage: 60,
              air: 56,
              freeze: 0,
              chaos: 13,
            },
            {
              playStyle: 2,
              difficulty: 3,
              level: 11,
              notes: 382,
              freezeArrow: 0,
              shockArrow: 0,
              stream: 81,
              voltage: 60,
              air: 60,
              freeze: 0,
              chaos: 31,
            },
          ],
        },
        {
          id: 'I8bQ8ilD9l1Qi9Q9iI0q6qqqiolo01QP',
          name: 'PARANOiA(X-Special)',
          nameKana: 'PARANOIA X SPECIAL',
          nameIndex: 25,
          artist: '180',
          series: 'DDR X',
          minBPM: 180,
          maxBPM: 180,
          charts: [
            {
              playStyle: 1,
              difficulty: 4,
              level: 13,
              notes: 371,
              freezeArrow: 12,
              shockArrow: 0,
              stream: 78,
              voltage: 60,
              air: 65,
              freeze: 18,
              chaos: 26,
            },
            {
              playStyle: 2,
              difficulty: 4,
              level: 14,
              notes: 352,
              freezeArrow: 42,
              shockArrow: 0,
              stream: 74,
              voltage: 60,
              air: 76,
              freeze: 48,
              chaos: 27,
            },
          ],
        },
        {
          id: 'dDO8ili1081QQIb86POQ8qd0P111011o',
          name: 'SP-TRIP MACHINE～JUNGLE MIX～(X-Special)',
          nameKana: 'SP TRIP MACHINE JUNGLE MIX X SPECIAL',
          nameIndex: 28,
          artist: 'DE-SIRE',
          series: 'DDR X',
          minBPM: 160,
          maxBPM: 160,
          charts: [
            {
              playStyle: 1,
              difficulty: 4,
              level: 11,
              notes: 254,
              freezeArrow: 18,
              shockArrow: 0,
              stream: 63,
              voltage: 53,
              air: 61,
              freeze: 43,
              chaos: 29,
            },
            {
              playStyle: 2,
              difficulty: 4,
              level: 12,
              notes: 262,
              freezeArrow: 11,
              shockArrow: 0,
              stream: 65,
              voltage: 53,
              air: 40,
              freeze: 22,
              chaos: 30,
            },
          ],
        },
      ]

      beforeAll(async () => {
        const container = getContainer('Songs')
        for (const song of songs) {
          await container.items.create(song)
        }
      })

      test('/1/1 returns "404 Not Found"', async () => {
        // Arrange
        context.bindingData.playStyle = 1
        context.bindingData.level = 1

        // Act
        await searchCharts(context)

        // Assert
        expect(context.res?.status).toBe(404)
        expect(context.res?.body).toBe(
          'Not found chart that {playStyle: 1, level: 1}'
        )
      })

      test.each([
        [
          1,
          4,
          [
            {
              id: songs[0].id,
              name: songs[0].name,
              series: songs[0].series,
              playStyle: songs[0].charts[0].playStyle,
              difficulty: songs[0].charts[0].difficulty,
              level: songs[0].charts[0].level,
            },
          ],
        ],
        [
          1,
          11,
          [
            {
              id: songs[0].id,
              name: songs[0].name,
              series: songs[0].series,
              playStyle: songs[0].charts[3].playStyle,
              difficulty: songs[0].charts[3].difficulty,
              level: songs[0].charts[3].level,
            },
            {
              id: songs[2].id,
              name: songs[2].name,
              series: songs[2].series,
              playStyle: songs[2].charts[0].playStyle,
              difficulty: songs[2].charts[0].difficulty,
              level: songs[2].charts[0].level,
            },
          ],
        ],
        [
          2,
          14,
          [
            {
              id: songs[1].id,
              name: songs[1].name,
              series: songs[1].series,
              playStyle: songs[1].charts[1].playStyle,
              difficulty: songs[1].charts[1].difficulty,
              level: songs[1].charts[1].level,
            },
          ],
        ],
      ])(
        '/%i/%i returns "200 OK" with JSON body',
        async (playStyle, level, expected) => {
          // Arrange
          context.bindingData.playStyle = playStyle
          context.bindingData.level = level

          // Act
          await searchCharts(context)

          // Assert
          expect(context.res?.status).toBe(200)
          expect(context.res?.body).toStrictEqual(expected)
        }
      )

      afterAll(async () => {
        const container = getContainer('Songs')
        for (const song of songs) {
          await container.item(song.id, song.nameIndex).delete()
        }
      })
    }
  )
})
