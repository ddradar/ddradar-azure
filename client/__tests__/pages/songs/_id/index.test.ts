import type { Api } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { getSongInfo } from '~/api/song'
import SongPage from '~/pages/songs/_id/index.vue'

jest.mock('~/api/song', () => ({
  ...(jest.requireActual('~/api/song') as object),
  getSongInfo: jest.fn(),
}))
const localVue = createLocalVue()
localVue.use(Buefy)

const song: Api.SongInfo = {
  id: '8Il6980di8P89lil1PDIqqIbiq1QO8lQ',
  name: 'MAKE IT BETTER',
  nameKana: 'MAKE IT BETTER',
  nameIndex: 22,
  artist: 'mitsu-O!',
  series: 'DDR 1st',
  minBPM: 119,
  maxBPM: 119,
  charts: [
    {
      playStyle: 1,
      difficulty: 0,
      level: 3,
      notes: 67,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 14,
      voltage: 14,
      air: 9,
      freeze: 0,
      chaos: 0,
    },
    {
      playStyle: 1,
      difficulty: 1,
      level: 7,
      notes: 143,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 31,
      voltage: 29,
      air: 47,
      freeze: 0,
      chaos: 3,
    },
    {
      playStyle: 1,
      difficulty: 2,
      level: 9,
      notes: 188,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 41,
      voltage: 39,
      air: 27,
      freeze: 0,
      chaos: 13,
    },
    {
      playStyle: 1,
      difficulty: 3,
      level: 12,
      notes: 212,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 46,
      voltage: 39,
      air: 54,
      freeze: 0,
      chaos: 19,
    },
    {
      playStyle: 2,
      difficulty: 1,
      level: 7,
      notes: 130,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 28,
      voltage: 29,
      air: 61,
      freeze: 0,
      chaos: 1,
    },
    {
      playStyle: 2,
      difficulty: 2,
      level: 9,
      notes: 181,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 40,
      voltage: 39,
      air: 30,
      freeze: 0,
      chaos: 11,
    },
    {
      playStyle: 2,
      difficulty: 3,
      level: 11,
      notes: 220,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 48,
      voltage: 54,
      air: 27,
      freeze: 0,
      chaos: 41,
    },
  ],
}

describe('pages/songs/_id/index.vue', () => {
  const mocks = { $accessor: { isAdmin: false } }

  describe('snapshot test', () => {
    const stubs = { NuxtLink: RouterLinkStub }
    const data = () => ({ song, playStyle: 1, difficulty: 0 })

    test('renders correctly', () => {
      const wrapper = shallowMount(SongPage, { localVue, mocks, data })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders "Edit" button if admin', () => {
      const mocks = { $accessor: { isAdmin: true } }
      const wrapper = shallowMount(SongPage, { localVue, mocks, stubs, data })
      expect(wrapper).toMatchSnapshot()
    })
  })

  // LifeCycle
  describe('validate()', () => {
    test.each([undefined, '', 'foo', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'])(
      '/%s returns false',
      id => {
        // Arrange
        const wrapper = shallowMount(SongPage, { localVue, mocks })
        const ctx = { params: { id } } as unknown as Context

        // Act
        const result = wrapper.vm.$options.validate!(ctx)

        // Assert
        expect(result).toBe(false)
      }
    )
    test(`/${song.id} returns true`, () => {
      // Arrange
      const wrapper = shallowMount(SongPage, { localVue, mocks })
      const ctx = { params: { id: song.id } } as unknown as Context

      // Act
      const result = wrapper.vm.$options.validate!(ctx)

      // Assert
      expect(result).toBe(true)
    })
  })
  describe('asyncData()', () => {
    beforeAll(() => mocked(getSongInfo).mockResolvedValue(song))
    beforeEach(() => mocked(getSongInfo).mockClear())

    test(`/${song.id} returns { song }`, async () => {
      // Arrange
      const wrapper = shallowMount(SongPage, { localVue, mocks })
      const ctx = { params: { id: song.id } } as unknown as Context

      // Act
      const result = await wrapper.vm.$options.asyncData!(ctx)

      // Assert
      expect(result).toStrictEqual({ song })
      expect(mocked(getSongInfo)).toBeCalled()
    })
    test.each([
      ['#10', 1, 0],
      ['#14', 1, 4],
      ['#21', 2, 1],
      ['#23', 2, 3],
    ])(
      `/${song.id}%s returns { song, playStyle: %i, difficulty: %i }`,
      async (hash, playStyle, difficulty) => {
        // Arrange
        const wrapper = shallowMount(SongPage, { localVue, mocks })
        const ctx = { payload: song, route: { hash } } as unknown as Context

        // Act
        const result = await wrapper.vm.$options.asyncData!(ctx)

        // Assert
        expect(result).toStrictEqual({ song, playStyle, difficulty })
        expect(mocked(getSongInfo)).not.toBeCalled()
      }
    )
  })
})
