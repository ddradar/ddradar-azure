import type { Context } from '@nuxt/types'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getCourseList } from '~/api/course'
import NonstopListPage from '~/pages/nonstop/_series/index.vue'

jest.mock('~/api/course')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('pages/nonstop/_series/index.vue', () => {
  const $fetchState = { pending: false }
  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    test('renders correctly', () => {
      // Arrange - Act
      const $route = { params: { series: '16' }, path: '/nonstop/16' }
      const mocks = { $fetchState, $route }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('validate()', () => {
    const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
    test.each(['', 'foo', '0', '1', '10'])('/%s returns false', series => {
      // Arrange
      const mocks = { $fetchState, $route: { params: { series } } }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })
      const ctx = { ...mocks.$route } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
    })
    test.each(['16', '17'])('/%s returns true', series => {
      // Arrange
      const mocks = { $fetchState, $route: { params: { series } } }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })
      const ctx = { ...mocks.$route } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })
  describe('fetch()', () => {
    const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
    const apiMock = mocked(getCourseList)
    beforeEach(() => {
      apiMock.mockClear()
      apiMock.mockResolvedValue([])
    })
    test.each([
      ['16', 16],
      ['17', 17],
    ])('/%s calls getCourseList($http, %i, 1)', async (series, expected) => {
      // Arrange
      const $route = { params: { series }, path: `/nonstop/${series}` }
      const mocks = { $fetchState, $http: { $get: jest.fn() }, $route }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith(mocks.$http, expected, 1)
    })
  })

  // Computed
  describe('get title()', () => {
    test.each([
      ['16', 'ja', 'DanceDanceRevolution A20 - NONSTOP'],
      ['17', 'ja', 'DanceDanceRevolution A20 PLUS - NONSTOP'],
      ['16', 'en', 'DanceDanceRevolution A20 - NONSTOP'],
      ['17', 'en', 'DanceDanceRevolution A20 PLUS - NONSTOP'],
    ])('/%s (locale:%s) returns "%s"', (series, locale, expected) => {
      // Arrange
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const $route = { params: { series }, path: `/nonstop/${series}` }
      const mocks = { $fetchState, $route }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
