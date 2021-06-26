import type { Context } from '@nuxt/types'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { searchSongBySeries } from '~/api/song'
import SongBySeriesPage from '~/pages/series/_seriesIndex.vue'

jest.mock('~/api/song')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/series/_seriesIndex.vue', () => {
  const $fetchState = { pending: false }
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '1.0'])(
      '/name/%s returns false',
      seriesIndex => {
        // Arrange
        const wrapper = shallowMount(SongBySeriesPage, {
          localVue,
          mocks: { $route: { params: { seriesIndex } }, $fetchState },
        })
        const ctx = { params: { seriesIndex } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['0', '1', '9', '10', '16'])(
      '/name/%s returns true',
      seriesIndex => {
        // Arrange
        const wrapper = shallowMount(SongBySeriesPage, {
          localVue,
          mocks: { $route: { params: { seriesIndex } }, $fetchState },
        })
        const ctx = { params: { seriesIndex } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
      }
    )
  })
  describe('fetch()', () => {
    const apiMock = mocked(searchSongBySeries)
    beforeEach(() => {
      apiMock.mockClear()
      apiMock.mockResolvedValue([])
    })

    test.each(['0', '1', '9', '10', '16'])(
      'calls searchSongBySeries($http, %s)',
      async seriesIndex => {
        // Arrange
        const $http = { $get: jest.fn() }
        const wrapper = shallowMount(SongBySeriesPage, {
          localVue,
          mocks: { $route: { params: { seriesIndex } }, $http, $fetchState },
        })

        // Act
        // @ts-ignore
        await wrapper.vm.$options.fetch?.call(wrapper.vm)

        // Assert
        expect(apiMock).toBeCalledTimes(1)
        expect(apiMock).toBeCalledWith($http, parseInt(seriesIndex, 10))
      }
    )
  })
  describe('get title()', () => {
    test.each([
      ['0', 'DDR 1st'],
      ['10', 'DDR X'],
      ['16', 'DanceDanceRevolution A20'],
      ['17', 'DanceDanceRevolution A20 PLUS'],
    ])('name/%s route returns %s', (seriesIndex, expected) => {
      // Arrange
      const wrapper = shallowMount(SongBySeriesPage, {
        localVue,
        mocks: { $route: { params: { seriesIndex } }, $fetchState },
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
