import type { Api } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { searchCharts } from '~/api/song'
import ChartLevelPage from '~/pages/_style/_level.vue'

jest.mock('~/api/song')

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/_style/_level.vue', () => {
  const $fetchState = { pending: false }
  const stubs = { NuxtLink: RouterLinkStub, ChartList: true }

  describe.each(['single', 'double'])('snapshot test (/%s/19)', style => {
    test('renders correctly', () => {
      // Arrange
      const mocks = { $route: { params: { level: '19', style } }, $fetchState }
      const data = () => ({ charts: [] })
      const wrapper = mount(ChartLevelPage, { localVue, mocks, stubs, data })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('validate()', () => {
    test.each([
      ['', '1'],
      ['DOUBLE', '1'],
      ['single', ''],
      ['double', 'foo'],
      ['single', '0'],
      ['double', '21'],
      ['single', '-1'],
      ['single', '1.0'],
    ])('/%s/%s returns false', (style, level) => {
      // Arrange
      const wrapper = shallowMount(ChartLevelPage, {
        localVue,
        mocks: {
          $route: { params: { style, level } },
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub, ChartList: true },
      })
      const ctx = ({ params: { style, level } } as unknown) as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
    })
    test.each([
      ['single', '1'],
      ['double', '1'],
      ['single', '9'],
      ['double', '9'],
      ['single', '19'],
      ['double', '19'],
      ['single', '20'],
      ['double', '20'],
    ])('/%s/%s returns true', (style, level) => {
      // Arrange
      const params = { style, level }
      const wrapper = shallowMount(ChartLevelPage, {
        localVue,
        mocks: { $route: { params }, $fetchState },
        stubs: { NuxtLink: RouterLinkStub, ChartList: true },
      })
      const ctx = ({ params } as unknown) as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })

  describe('fetch()', () => {
    test.each([
      ['single', '1', 1, 1],
      ['single', '9', 1, 9],
      ['double', '19', 2, 19],
      ['double', '20', 2, 20],
    ])(
      '/%s/%s calls searchCharts($http, %i, %i)',
      async (style, level, styleExpected, levelExpected) => {
        // Arrange
        const apiMock = mocked(searchCharts)
        const charts: Api.ChartInfo[] = []
        apiMock.mockResolvedValue(charts)
        const $route = { params: { style, level } }
        const $http = {}
        const mocks = { $route, $fetchState, $http }
        const wrapper = shallowMount(ChartLevelPage, { localVue, mocks, stubs })

        // Act
        // @ts-ignore
        await wrapper.vm.$options.fetch!.call(wrapper.vm)

        // Assert
        expect(apiMock).toBeCalledWith($http, styleExpected, levelExpected)
        expect(wrapper.vm.$data.charts).toBe(charts)
      }
    )
  })

  describe('get title()', () => {
    test.each([
      ['single', '1', 'SINGLE 1'],
      ['single', '9', 'SINGLE 9'],
      ['double', '19', 'DOUBLE 19'],
      ['double', '20', 'DOUBLE 20'],
    ])('/%s/%s route returns %s', (style, level, expected) => {
      // Arrange
      const mocks = { $route: { params: { style, level } }, $fetchState }
      const wrapper = shallowMount(ChartLevelPage, { localVue, mocks, stubs })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
