import type { Api } from '@ddradar/core'

import {
  getNotificationInfo,
  getNotificationList,
  postNotification,
} from '~/api/notification'

type NotificationRequest = Parameters<typeof postNotification>[1]

describe('/api/notification.ts', () => {
  const $http = {
    $get: jest.fn<Promise<any>, [string]>(),
    $post: jest.fn<Promise<any>, [string]>(),
  }
  beforeEach(() => {
    $http.$get.mockClear()
    $http.$post.mockClear()
  })

  describe('getNotificationList', () => {
    const notificationList: Api.NotificationListData[] = []
    beforeEach(() => $http.$get.mockResolvedValue(notificationList))
    test.each([
      [true, '/api/v1/notification?scope=top'],
      [false, '/api/v1/notification'],
      [undefined, '/api/v1/notification'],
    ])('($http, %p) calls GET "%s"', async (topOnly, uri) => {
      // Arrange - Act
      const val = await getNotificationList($http, topOnly)

      // Assert
      expect(val).toBe(notificationList)
      expect($http.$get).toBeCalledTimes(1)
      expect($http.$get).lastCalledWith(uri)
    })
  })

  describe('getNotificationInfo', () => {
    const id = 'notification-id'
    const notification: Api.NotificationInfo = {
      id,
      sender: 'SYSTEM',
      pinned: true,
      type: 'is-info',
      icon: 'account',
      title: 'Title',
      body: 'Message Body',
      timeStamp: 1597244400,
    } as const
    beforeEach(() => $http.$get.mockResolvedValue(notification))
    test(`($http, ${id}) calls GET "/api/v1/notification/${id}"`, async () => {
      // Arrange - Act
      const val = await getNotificationInfo($http, id)

      // Assert
      expect(val).toBe(notification)
      expect($http.$get).toBeCalledTimes(1)
      expect($http.$get).lastCalledWith(`/api/v1/notification/${id}`)
    })
  })

  describe('postNotification', () => {
    const notification: NotificationRequest = {
      id: 'return-value',
      icon: 'account',
      pinned: true,
      type: 'is-info',
      title: 'Return title',
      body: 'Return message body',
    } as const
    beforeEach(() => $http.$post.mockResolvedValue(notification))
    test('calls POST "/api/v1/notification"', async () => {
      // Arrange
      const body: NotificationRequest = {
        id: 'foo',
        icon: 'account',
        pinned: true,
        type: 'is-info',
        title: 'title',
        body: 'Message body',
      }

      // Act
      const val = await postNotification($http, body)

      // Assert
      expect(val).toBe(notification)
      expect($http.$post).toBeCalledTimes(1)
      expect($http.$post).lastCalledWith('/api/v1/notification', {
        ...body,
        sender: 'SYSTEM',
      })
    })
  })
})
