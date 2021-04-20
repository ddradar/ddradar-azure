import { Api } from '@ddradar/core'

import postNotification from '.'

Date.now = jest.fn(() => 1597114800000)

describe('POST /api/v1/notification', () => {
  const validBody: Api.NotificationBody = {
    sender: 'SYSTEM',
    pinned: true,
    type: 'is-info',
    icon: 'info',
    title: 'このサイトはベータ版です',
    body: 'このWebサイトはベータ版環境です。',
  }

  test.each([
    undefined,
    null,
    true,
    1,
    'foo',
    {},
    { ...validBody, sender: 'USER' },
    { ...validBody, pinned: 'false' },
    { ...validBody, type: 'is-dark' },
    { ...validBody, icon: false },
    { ...validBody, title: 1 },
    { ...validBody, body: [] },
    { ...validBody, timeStamp: [] },
  ])('(%p) returns "400 Bad Request"', async (body: unknown) => {
    // Arrange - Act
    const result = await postNotification(null, { body })

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test.each([
    [validBody, { ...validBody, timeStamp: 1597114800 }],
    [
      { ...validBody, id: 'foo' },
      { ...validBody, id: 'foo', timeStamp: 1597114800 },
    ],
    [
      { ...validBody, timeStamp: 1597028400 },
      { ...validBody, timeStamp: 1597028400 },
    ],
  ])('(%p) returns "200 OK" with JSON body %p', async (body, expected) => {
    // Arrange - Act
    const result = await postNotification(null, { body })

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual(expected)
    expect(result.document).toStrictEqual(expected)
  })
})
