import type { Api } from '@ddradar/core'
import { mocked } from 'ts-jest/utils'
import { Store } from 'vuex'

import { getClientPrincipal } from '~/api/auth'
import { getCurrentUser, postUserInfo } from '~/api/user'
import { actions, getters, mutations, RootState, state } from '~/store'

jest.mock('~/api/auth')
jest.mock('~/api/user')

const auth: Api.ClientPrincipal = {
  identityProvider: 'github',
  userId: 'auto-generated-id',
  userDetails: 'foo',
  userRoles: ['anonymous', 'authenticated'],
}
const user: Api.CurrentUserInfo = {
  id: 'foo',
  name: 'Some User',
  area: 13,
  isPublic: true,
  code: 10000000,
}

describe('./store/index.ts', () => {
  describe('state', () => {
    test('returns { auth: null, user: null }', () => {
      expect(state()).toStrictEqual({ auth: null, user: null })
    })
  })
  describe('getters', () => {
    describe('name', () => {
      test('returns user.name', () => {
        // Arrange
        const state: RootState = { auth: null, user }

        // Act - Assert
        expect(getters.name(state)).toBe(user.name)
      })
      test('returns undefined if user is null', () => {
        // Arrange
        const state: RootState = { auth: null, user: null }

        // Act - Assert
        expect(getters.name(state)).toBeUndefined()
      })
    })
    describe('isLoggedIn', () => {
      test('({ user: null }) returns false', () => {
        // Arrange
        const state: RootState = { auth, user: null }

        // Act - Assert
        expect(getters.isLoggedIn(state)).toBe(false)
      })
      test('({ user }) returns true', () => {
        // Arrange
        const state: RootState = { auth, user }

        // Act - Assert
        expect(getters.isLoggedIn(state)).toBe(true)
      })
    })
    describe('isAdmin', () => {
      test('returns false if auth is null', () => {
        // Arrange
        const state: RootState = { auth: null, user }

        // Act - Assert
        expect(getters.isAdmin(state)).toBe(false)
      })
      test('returns false if user does not have administrator role', () => {
        // Arrange
        const state: RootState = { auth, user }

        // Act - Assert
        expect(getters.isAdmin(state)).toBe(false)
      })
      test('returns true if user have administrator role', () => {
        // Arrange
        const state: RootState = {
          auth: { ...auth, userRoles: [...auth.userRoles, 'administrator'] },
          user,
        }

        // Act - Assert
        expect(getters.isAdmin(state)).toBe(true)
      })
    })
  })
  describe('mutations', () => {
    test.each([
      [{ auth: null, user: null }, auth],
      [{ auth, user }, null],
    ])('setAuth(%p, %p) changes state.auth', (state, auth) => {
      // Arrange - Act
      mutations.setAuth(state, auth)

      // Assert
      expect(state.auth).toStrictEqual(auth)
    })
    test.each([
      [{ auth: null, user: null }, user],
      [{ auth, user }, null],
    ])('setUser(%p, %p) changes state.user', (state, user) => {
      // Arrange - Act
      mutations.setUser(state, user)

      // Assert
      expect(state.user).toStrictEqual(user)
    })
  })
  describe('actions', () => {
    const context = { commit: jest.fn() } as any
    const store = { $http: {} } as Store<any>
    beforeEach(() => context.commit.mockClear())
    describe('fetchUser()', () => {
      test('calls getClientPrincipal() API only if clientPrincipal is null', async () => {
        // Arrange
        const clientMock = mocked(getClientPrincipal)
        const userMock = mocked(getCurrentUser)
        clientMock.mockResolvedValue(null)

        // Act
        await actions.fetchUser.call(store, context)

        // Assert
        expect(context.commit).toBeCalledWith('setAuth', null)
        expect(context.commit).toBeCalledWith('setUser', null)
        expect(clientMock).toBeCalledWith(store.$http)
        expect(userMock).not.toHaveBeenCalled()
      })
      test('calls getCurrentUser() API if clientPrincipal is exists', async () => {
        // Arrange
        const clientMock = mocked(getClientPrincipal)
        const userMock = mocked(getCurrentUser)
        clientMock.mockResolvedValue(auth)
        userMock.mockResolvedValue(user)

        // Act
        await actions.fetchUser.call(store, context)

        // Assert
        expect(context.commit).toBeCalledWith('setAuth', auth)
        expect(context.commit).toBeCalledWith('setUser', user)
        expect(clientMock).toBeCalledWith(store.$http)
        expect(userMock).toBeCalledWith(store.$http)
      })
      test('sets user null if getCurrentUser() API throws error', async () => {
        // Arrange
        const clientMock = mocked(getClientPrincipal)
        const userMock = mocked(getCurrentUser)
        clientMock.mockResolvedValue(auth)
        userMock.mockRejectedValue(new Error('error'))

        // Act
        await actions.fetchUser.call(store, context)

        // Assert
        expect(context.commit).toBeCalledWith('setAuth', auth)
        expect(context.commit).toBeCalledWith('setUser', null)
        expect(clientMock).toBeCalledWith(store.$http)
        expect(userMock).toBeCalledWith(store.$http)
      })
    })
    describe('logout()', () => {
      test('calls setAuth(null) and setUser(null)', () => {
        // Arrange - Act
        actions.logout.call(store, context)

        // Assert
        expect(context.commit).toBeCalledWith('setAuth', null)
        expect(context.commit).toBeCalledWith('setUser', null)
      })
    })
    describe('saveUser()', () => {
      test('calls postUserInfo() API', async () => {
        // Arrange
        const postMock = mocked(postUserInfo)
        const updated = { ...user, id: 'bar' }
        postMock.mockResolvedValue(updated)

        // Act
        await actions.saveUser.call(store, context, user)

        // Assert
        expect(context.commit).toBeCalledWith('setUser', updated)
        expect(postMock).toBeCalledWith(store.$http, user)
      })
    })
  })
})
