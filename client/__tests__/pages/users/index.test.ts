import type { Api } from '@ddradar/core'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getUserList } from '~/api/user'
import UserListPage from '~/pages/users/index.vue'
import { danger } from '~/utils/popup'

jest.mock('~/api/user')
jest.mock('~/utils/popup')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('pages/users/index.vue', () => {
  const users = [...Array(10).keys()].map(i => ({
    id: `user_${i}`,
    name: `User ${i}`,
    area: i,
  })) as Api.UserInfo[]
  const stubs = { NuxtLink: RouterLinkStub }
  describe('snapshot test', () => {
    test.each(['ja', 'en'])(
      '{ locale: "%s" } renders correctly',
      async locale => {
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = mount(UserListPage, { localVue, i18n, stubs })
        await wrapper.vm.$nextTick()
        expect(wrapper).toMatchSnapshot()
      }
    )
    test.each(['ja', 'en'])(
      '{ locale: "%s" } renders user list',
      async locale => {
        const wrapper = mount(UserListPage, {
          localVue,
          i18n: new VueI18n({ locale, silentFallbackWarn: true }),
          stubs,
          data: () => ({ users }),
        })
        await wrapper.vm.$nextTick()
        expect(wrapper).toMatchSnapshot()
      }
    )
    test.each(['ja', 'en'])(
      '{ locale: "%s" } renders loading',
      async locale => {
        const wrapper = mount(UserListPage, {
          localVue,
          i18n: new VueI18n({ locale, silentFallbackWarn: true }),
          stubs,
          data: () => ({ loading: true }),
        })
        await wrapper.vm.$nextTick()
        expect(wrapper).toMatchSnapshot()
      }
    )
  })
  describe('search()', () => {
    const dangerMock = mocked(danger)
    const apiMock = mocked(getUserList)
    const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
    const mocks = { $buefy: {}, $http: {} }
    const d = { name: 'foo', area: 13, code: 10000000 }
    beforeEach(() => {
      dangerMock.mockClear()
      apiMock.mockClear()
    })

    test('calls getUserList($http, name, area, code)', async () => {
      // Arrange
      apiMock.mockResolvedValue(users)
      const wrapper = shallowMount(UserListPage, {
        localVue,
        i18n,
        mocks,
        stubs,
        data: () => ({ ...d }),
      })

      // Act
      // @ts-ignore
      await wrapper.vm.search()

      // Assert
      expect(apiMock).toBeCalledWith(mocks.$http, d.name, d.area, d.code)
      expect(dangerMock).not.toBeCalled()
      expect(wrapper.vm.$data.users).toBe(users)
    })
    test('calls popup.danger($buefy) if cause error', async () => {
      // Arrange
      const message = '500'
      apiMock.mockRejectedValue(message)
      const wrapper = shallowMount(UserListPage, {
        localVue,
        i18n,
        mocks,
        stubs,
        data: () => ({ ...d }),
      })

      // Act
      // @ts-ignore
      await wrapper.vm.search()

      // Assert
      expect(apiMock).toBeCalledWith(mocks.$http, d.name, d.area, d.code)
      expect(dangerMock).toBeCalledWith(mocks.$buefy, message)
    })
  })
})
