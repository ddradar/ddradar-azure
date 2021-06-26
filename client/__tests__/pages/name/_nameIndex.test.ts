import type { Context } from '@nuxt/types'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { searchSongByName } from '~/api/song'
import SongByNamePage from '~/pages/name/_nameIndex.vue'

jest.mock('~/api/song')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/name/_nameIndex.vue', () => {
  const $fetchState = { pending: false }
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '1.0'])(
      '/name/%s returns false',
      nameIndex => {
        // Arrange
        const wrapper = shallowMount(SongByNamePage, {
          localVue,
          mocks: { $route: { params: { nameIndex } }, $fetchState },
        })
        const ctx = { params: { nameIndex } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['0', '1', '9', '10', '36'])(
      '/name/%s returns true',
      nameIndex => {
        // Arrange
        const wrapper = shallowMount(SongByNamePage, {
          localVue,
          mocks: { $route: { params: { nameIndex } }, $fetchState },
        })
        const ctx = { params: { nameIndex } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
      }
    )
  })
  describe('fetch()', () => {
    const apiMock = mocked(searchSongByName)
    beforeEach(() => {
      apiMock.mockClear()
      apiMock.mockResolvedValue([])
    })

    test.each(['0', '1', '9', '10', '36'])(
      'calls /songs/name/%s API',
      async nameIndex => {
        // Arrange
        const $http = { $get: jest.fn() }
        const wrapper = shallowMount(SongByNamePage, {
          localVue,
          mocks: { $route: { params: { nameIndex } }, $fetchState, $http },
        })

        // Act
        // @ts-ignore
        await wrapper.vm.$options.fetch?.call(wrapper.vm)

        // Assert
        expect(apiMock).toBeCalledTimes(1)
        expect(apiMock).toBeCalledWith($http, parseInt(nameIndex, 10))
      }
    )
  })
  describe('get title()', () => {
    test.each([
      ['0', 'あ'],
      ['9', 'わ'],
      ['10', 'A'],
      ['35', 'Z'],
      ['36', '数字・記号'],
    ])('name/%s route returns %s', (nameIndex, expected) => {
      // Arrange
      const wrapper = shallowMount(SongByNamePage, {
        localVue,
        mocks: { $route: { params: { nameIndex } }, $fetchState },
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
