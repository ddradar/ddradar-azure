import type { Api } from '@ddradar/core'

import {
  existsUser,
  getClearStatus,
  getCurrentUser,
  getGrooveRadar,
  getScoreStatus,
  getUserInfo,
  getUserList,
  postUserInfo,
} from '~/api/user'

describe('./api/user.ts', () => {
  const user: Api.CurrentUserInfo = {
    id: 'foo_user',
    name: 'Foo',
    area: 13,
    isPublic: true,
  }
  const $http = {
    $get: jest.fn<Promise<any>, [string, any]>(),
    $post: jest.fn<Promise<any>, [string, Api.CurrentUserInfo]>(),
  }
  beforeEach(() => {
    $http.$get.mockClear()
    $http.$post.mockClear()
  })

  describe('existsUser', () => {
    test(`($http, ${user.id}) calls GET "/api/v1/user/exists/${user.id}"`, async () => {
      // Arrange
      $http.$get.mockResolvedValue({ exists: true })

      // Act
      const result = await existsUser($http, user.id)

      // Assert
      expect(result).toBe(true)
      expect($http.$get).toBeCalledWith('/api/v1/user/exists/foo_user')
    })
  })

  describe('getCurrentUser', () => {
    test('($http) calls GET "/api/v1/user"', async () => {
      // Arrange
      $http.$get.mockResolvedValue(user)

      // Act
      const result = await getCurrentUser($http)

      // Assert
      expect(result).toBe(user)
      expect($http.$get).toBeCalledWith('/api/v1/user')
    })
  })

  describe('getUserList', () => {
    beforeAll(() => $http.$get.mockResolvedValue([]))
    test.each([
      [undefined, undefined, undefined, ''] as const,
      ['', 0, 0, ''] as const,
      ['foo', undefined, undefined, 'name=foo'] as const,
      [undefined, 13, undefined, 'area=13'] as const,
      [undefined, undefined, 10000000, 'code=10000000'] as const,
      ['foo', 26, 20000000, 'name=foo&area=26&code=20000000'] as const,
    ])(
      '($http, "%s", %i, %i) calls  GET "/api/v1/users%s"',
      async (name, area, code, query) => {
        // Arrange - Act
        const result = await getUserList($http, name, area, code)

        expect(result).toHaveLength(0)
        expect($http.$get.mock.calls[0][0]).toBe('/api/v1/users')
        expect($http.$get.mock.calls[0][1].searchParams.toString()).toBe(query)
      }
    )
  })

  describe('getUserInfo', () => {
    test(`($http, "${user.id}") calls GET "/api/v1/users/${user.id}"`, async () => {
      // Arrange
      $http.$get.mockResolvedValue(user)

      // Act
      const result = await getUserInfo($http, user.id)

      // Assert
      expect(result).toBe(user)
      expect($http.$get).toBeCalledWith('/api/v1/users/foo_user')
    })
  })

  describe('getClearStatus', () => {
    test.each([
      [1, 'playStyle=1'],
      [2, 'playStyle=2'],
    ])(
      `($http, "${user.id}", %i) calls GET "/api/v1/users/${user.id}/clear?%s"`,
      async (playStyle, query) => {
        // Arrange
        $http.$get.mockResolvedValue([])

        // Act
        const result = await getClearStatus($http, user.id, playStyle as 1 | 2)

        // Assert
        expect(result).toHaveLength(0)
        expect($http.$get).toBeCalledWith(
          `/api/v1/users/${user.id}/clear?${query}`
        )
      }
    )
  })

  describe('getScoreStatus', () => {
    test.each([
      [1, 'playStyle=1'],
      [2, 'playStyle=2'],
    ])(
      `($http, "${user.id}", %i) calls GET "/api/v1/users/${user.id}/score?%s"`,
      async (playStyle, query) => {
        // Arrange
        $http.$get.mockResolvedValue([])

        // Act
        const result = await getScoreStatus($http, user.id, playStyle as 1 | 2)

        // Assert
        expect(result).toHaveLength(0)
        expect($http.$get).toBeCalledWith(
          `/api/v1/users/${user.id}/score?${query}`
        )
      }
    )
  })

  describe('getGrooveRadar', () => {
    test.each([
      [1, '1'],
      [2, '2'],
    ])(
      `($http, "${user.id}", %i) calls GET "/api/v1/users/${user.id}/radar/%s"`,
      async (playStyle, query) => {
        // Arrange
        $http.$get.mockResolvedValue([])

        // Act
        const result = await getGrooveRadar($http, user.id, playStyle as 1 | 2)

        // Assert
        expect(result).toHaveLength(0)
        expect($http.$get).toBeCalledWith(
          `/api/v1/users/${user.id}/radar/${query}`
        )
      }
    )
  })

  describe('postUserInfo', () => {
    test(`($http, user) calls POST "/api/v1/user"`, async () => {
      // Arrange - Act
      await postUserInfo($http, user)

      // Assert
      expect($http.$post).toBeCalledWith('/api/v1/user', user)
    })
  })
})
