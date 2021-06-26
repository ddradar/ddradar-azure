import { notification } from '@ddradar/core/__tests__/data'
import type { Context } from '@nuxt/types'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { getNotificationInfo, postNotification } from '~/api/notification'
import EditorPage from '~/pages/admin/notification/_id.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/notification')
jest.mock('~/utils/popup')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/admin/notification/_id.vue', () => {
  describe('snapshot test', () => {
    test('renders correctly', () => {
      // Arrange
      const data = () => ({ ...notification })
      const wrapper = mount(EditorPage, { localVue, data })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Computed
  describe('get pageTitle()', () => {
    test.each([
      ['', 'Add Notification'],
      ['foo', 'Update Notification'],
    ])('/%s returns "%s"', (id, expected) => {
      // Arrange
      const data = () => ({ id })
      const wrapper = shallowMount(EditorPage, { localVue, data })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.pageTitle).toBe(expected)
    })
  })
  describe('get hasError()', () => {
    test('({ title: "title", body: "body" }) returns false', () => {
      // Arrange
      const data = () => ({ title: 'title', body: 'body' })
      const wrapper = shallowMount(EditorPage, { localVue, data })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.hasError).toBe(false)
    })
    test.each([
      {},
      { title: 'title' },
      { body: 'body' },
      { title: 'title', body: '' },
    ])('(%p) returns true', d => {
      // Arrange
      const data = () => ({ ...d })
      const wrapper = shallowMount(EditorPage, { localVue, data })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.hasError).toBe(true)
    })
  })

  // LifeCycle
  describe('asyncData()', () => {
    beforeAll(() => mocked(getNotificationInfo).mockResolvedValue(notification))
    beforeEach(() => mocked(getNotificationInfo).mockClear())

    test('/ does not call getNotificationInfo()', async () => {
      // Arrange
      const wrapper = shallowMount(EditorPage, { localVue })
      const ctx = { params: {} } as Context

      // Act
      const result = await wrapper.vm.$options.asyncData!(ctx)

      // Assert
      expect(result).toBeUndefined()
      expect(mocked(getNotificationInfo)).not.toBeCalled()
    })
    test(`/${notification.id} calls getNotificationInfo()`, async () => {
      // Arrange
      const wrapper = shallowMount(EditorPage, { localVue })
      const ctx = { params: { id: notification.id } } as unknown as Context

      // Act
      const result = await wrapper.vm.$options.asyncData!(ctx)

      // Assert
      expect(result).toStrictEqual({
        id: notification.id,
        pinned: notification.pinned,
        type: notification.type,
        icon: notification.icon,
        title: notification.title,
        body: notification.body,
        timeStamp: notification.timeStamp,
      })
      expect(mocked(getNotificationInfo)).toBeCalled()
    })
  })

  // Method
  describe('saveNotification()', () => {
    const data = () => ({ ...notification })
    const mocks = { $buefy: {}, $http: {} }
    const wrapper = shallowMount(EditorPage, { localVue, data, mocks })
    beforeEach(() => {
      mocked(postNotification).mockClear()
      mocked(popup.success).mockClear()
      mocked(popup.danger).mockClear()
    })

    test('calls popup.success()', async () => {
      // Arrange
      mocked(postNotification).mockResolvedValue({ ...notification })

      // Act
      // @ts-ignore
      await wrapper.vm.saveNotification()

      expect(mocked(postNotification)).toBeCalled()
      expect(mocked(popup.success)).toBeCalledWith(mocks.$buefy, 'Success!')
      expect(mocked(popup.danger)).not.toBeCalled()
    })
    test('calls popup.danger()', async () => {
      // Arrange
      const error = 'Error'
      mocked(postNotification).mockRejectedValue(error)

      // Act
      // @ts-ignore
      await wrapper.vm.saveNotification()

      expect(mocked(postNotification)).toBeCalled()
      expect(mocked(popup.success)).not.toBeCalled()
      expect(mocked(popup.danger)).toBeCalledWith(mocks.$buefy, error)
    })
  })
})
