import type { Api } from '@ddradar/core'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { existsUser } from '~/api/user'
import ProfilePage from '~/pages/profile.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/user')
jest.mock('~/utils/popup')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('pages/profile.vue', () => {
  const $accessor = { user: null }
  const user: Api.CurrentUserInfo = {
    id: 'test_user',
    name: 'Test User',
    area: 13,
    isPublic: true,
    code: 10000000,
    password: 'password',
  }
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  const data = () => ({ ...user })

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    test('renders correctly', () => {
      const mocks = { $accessor }
      const wrapper = mount(ProfilePage, { localVue, i18n, mocks })
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('get isNewUser()', () => {
    test('returns true if $accessor.user is null', () => {
      // Arrange
      const mocks = { $accessor: { user: null } }
      const wrapper = shallowMount(ProfilePage, { localVue, i18n, mocks })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isNewUser).toBe(true)
    })
    test('returns false if $accessor.user is not null', () => {
      // Arrange
      const mocks = { $accessor: { user } }
      const wrapper = shallowMount(ProfilePage, { localVue, i18n, mocks })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isNewUser).toBe(false)
    })
  })

  describe('get hasError()', () => {
    test.each([
      { type: 'is-danger' },
      { id: '@' },
      { name: null },
      { area: -1 },
      { code: 1.3 },
      { code: 100000000 },
    ])('returns true if %p', diff => {
      // Arrange
      const mocks = { $accessor }
      const data = () => ({ ...user, ...diff })
      const options = { localVue, i18n, mocks, data }
      const wrapper = shallowMount(ProfilePage, options)

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.hasError).toBe(true)
    })
    test.each([
      { ...user },
      { ...user, id: 'FOO' },
      { ...user, type: 'is-success' },
      { ...user, code: null },
    ])('returns false if %p', userData => {
      // Arrange
      const mocks = { $accessor }
      const data = () => ({ ...userData })
      const options = { localVue, i18n, mocks, data }
      const wrapper = shallowMount(ProfilePage, options)

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.hasError).toBe(false)
    })
  })

  describe('fetch()', () => {
    test('calls $accessor.fetchUser()', async () => {
      // Arrange
      const mocks = { $accessor: { user, fetchUser: jest.fn() } }
      const wrapper = shallowMount(ProfilePage, { localVue, i18n, mocks })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocks.$accessor.fetchUser).toBeCalled()
      expect(wrapper.vm.$data.id).toBe(user.id)
      expect(wrapper.vm.$data.name).toBe(user.name)
      expect(wrapper.vm.$data.area).toBe(user.area)
      expect(wrapper.vm.$data.code).toBe(user.code)
      expect(wrapper.vm.$data.isPublic).toBe(user.isPublic)
    })
    test('sets $accessor.auth.userDetails into this.id if new user', async () => {
      // Arrange
      const $accessor = {
        user: null,
        auth: { userDetails: 'github_user' },
        fetchUser: jest.fn(),
      }
      const mocks = { $accessor }
      const wrapper = shallowMount(ProfilePage, { localVue, i18n, mocks })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect($accessor.fetchUser).toBeCalled()
      expect(wrapper.vm.$data.id).toBe($accessor.auth.userDetails)
      expect(wrapper.vm.$data.name).toBe('')
      expect(wrapper.vm.$data.area).toBe(0)
      expect(wrapper.vm.$data.code).toBeNull()
      expect(wrapper.vm.$data.isPublic).toBe(true)
    })
    test('sets default if no auth', async () => {
      // Arrange
      const $accessor = { fetchUser: jest.fn() }
      const mocks = { $accessor }
      const wrapper = shallowMount(ProfilePage, { localVue, i18n, mocks })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect($accessor.fetchUser).toBeCalled()
      expect(wrapper.vm.$data.id).toBe('')
      expect(wrapper.vm.$data.name).toBe('')
      expect(wrapper.vm.$data.area).toBe(0)
      expect(wrapper.vm.$data.code).toBeNull()
      expect(wrapper.vm.$data.isPublic).toBe(true)
    })
  })

  describe('checkId()', () => {
    const mocks = { $accessor }
    const existsUserMock = mocked(existsUser)
    beforeEach(() => existsUserMock.mockClear())

    test.each([
      ['ja', 'ユーザーIDは必須です'],
      ['en', 'ID is required'],
    ])(
      '{ locale: "%s" } sets "%s" error if id is ""',
      async (locale, message) => {
        // Arrange
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const data = () => ({ ...user, id: '' })
        const options = { localVue, i18n, mocks, data }
        const wrapper = shallowMount(ProfilePage, options)

        // Act
        // @ts-ignore
        await wrapper.vm.checkId()

        // Assert
        expect(wrapper.vm.$data.type).toBe('is-danger')
        expect(wrapper.vm.$data.message).toBe(message)
      }
    )
    test.each([
      ['ja', 'ユーザーIDは半角英数字, ハイフン, アンダーバーのみ使用可能です'],
      [
        'en',
        'Only alphanumeric characters, hyphens, and underbars can be used for ID',
      ],
    ])(
      '{ locale: "%s" } sets "%s" error if id is "@"',
      async (locale, message) => {
        // Arrange
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const data = () => ({ ...user, id: '@' })
        const options = { localVue, i18n, mocks, data }
        const wrapper = shallowMount(ProfilePage, options)

        // Act
        // @ts-ignore
        await wrapper.vm.checkId()

        // Assert
        expect(wrapper.vm.$data.type).toBe('is-danger')
        expect(wrapper.vm.$data.message).toBe(message)
      }
    )
    test.each([
      ['ja', 'ユーザーIDはすでに使われています'],
      ['en', 'User ID is already in use'],
    ])(
      '{ locale: "%s" } sets "%s" error if id is duplicated',
      async (locale, message) => {
        // Arrange
        existsUserMock.mockResolvedValue(true)
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const options = { localVue, i18n, mocks, data }
        const wrapper = shallowMount(ProfilePage, options)

        // Act
        // @ts-ignore
        await wrapper.vm.checkId()

        // Assert
        expect(wrapper.vm.$data.type).toBe('is-danger')
        expect(wrapper.vm.$data.message).toBe(message)
      }
    )
    test.each([
      ['ja', 'ユーザーIDは使用可能です'],
      ['en', 'This ID is available'],
    ])(
      '{ locale: "%s" } sets "%s" message if id is available',
      async (locale, message) => {
        // Arrange
        existsUserMock.mockResolvedValue(false)
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const options = { localVue, i18n, mocks, data }
        const wrapper = shallowMount(ProfilePage, options)

        // Act
        // @ts-ignore
        await wrapper.vm.checkId()

        // Assert
        expect(wrapper.vm.$data.type).toBe('is-success')
        expect(wrapper.vm.$data.message).toBe(message)
      }
    )
    test('sets type: "" if API call failed', async () => {
      // Arrange
      existsUserMock.mockRejectedValue('Error')
      const options = { localVue, i18n, mocks, data }
      const wrapper = shallowMount(ProfilePage, options)

      // Act
      // @ts-ignore
      await wrapper.vm.checkId()

      // Assert
      expect(wrapper.vm.$data.type).toBe('')
      expect(wrapper.vm.$data.message).toBe('')
    })
  })

  describe('save()', () => {
    const successMock = mocked(popup.success)
    const dangerMock = mocked(popup.danger)
    const mocks = { $accessor: { saveUser: jest.fn<any, [any]>() }, $buefy: {} }
    beforeEach(() => {
      successMock.mockClear()
      dangerMock.mockClear()
      mocks.$accessor.saveUser.mockClear()
    })

    test.each([
      ['ja', '保存しました'],
      ['en', 'Saved'],
    ])(
      '{ locale: "%s" } calls popup.success($buefy, "%s")',
      async (locale, message) => {
        // Arrange
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const options = { localVue, i18n, mocks, data }
        const wrapper = shallowMount(ProfilePage, options)

        // Act
        // @ts-ignore
        await wrapper.vm.save()

        // Assert
        expect(mocks.$accessor.saveUser).toBeCalledWith(user)
        expect(successMock).toBeCalledWith(mocks.$buefy, message)
        expect(dangerMock).not.toBeCalled()
      }
    )
    test('calls popup.danger() if cause error', async () => {
      // Arrange
      const message = '500'
      mocks.$accessor.saveUser.mockRejectedValue(message)
      const options = { localVue, i18n, mocks, data }
      const wrapper = shallowMount(ProfilePage, options)

      // Act
      // @ts-ignore
      await wrapper.vm.save()

      // Assert
      expect(mocks.$accessor.saveUser).toBeCalledWith(user)
      expect(successMock).not.toBeCalled()
      expect(dangerMock).toBeCalledWith(mocks.$buefy, message)
    })
  })
})
