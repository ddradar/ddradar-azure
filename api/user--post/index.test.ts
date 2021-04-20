import type { HttpRequest } from '@azure/functions'
import { Database } from '@ddradar/core'
import { fetchLoginUser, fetchUser } from '@ddradar/db'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal } from '../auth'
import postUserInfo from '.'

jest.mock('../auth')
jest.mock('@ddradar/core')
jest.mock('@ddradar/db')

describe('POST /api/v1/user', () => {
  const req: Pick<HttpRequest, 'body' | 'headers'> = { body: {}, headers: {} }
  const userToBeUpdated = {
    id: 'exist_user',
    loginId: '2',
    name: 'EMI',
    area: 0,
    isPublic: false,
  } as const
  beforeAll(() => {
    mocked(Database.isUserSchema).mockReturnValue(true)
    mocked(fetchUser).mockResolvedValue(null)
    mocked(fetchLoginUser).mockResolvedValue(null)
  })
  beforeEach(() => {
    req.body = {}
    req.headers = {}
  })

  test('returns "401 Unauthenticated" if not logged in', async () => {
    // Arrange - Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(401)
  })

  test('returns "400 Bad Request" if body is not UserSchema', async () => {
    // Arrange
    req.body = {}
    mocked(getClientPrincipal).mockReturnValue({
      identityProvider: 'github',
      userDetails: 'login_user',
      userId: '1',
      userRoles: ['anonymous', 'authenticated'],
    })
    mocked(Database.isUserSchema).mockReturnValueOnce(false)

    // Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(400)
    expect(result.httpResponse.body).toBe('Body is not UserSchema')
  })

  test('returns "200 OK" with JSON body (Create)', async () => {
    // Arrange
    const body: Database.UserSchema = {
      id: 'new_user',
      name: 'New User',
      area: 13,
      code: 10000000,
      isPublic: true,
    }
    req.body = body
    mocked(getClientPrincipal).mockReturnValueOnce({
      identityProvider: 'github',
      userDetails: body.id,
      userId: '1',
      userRoles: ['anonymous', 'authenticated'],
    })

    // Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual(body)
    expect(result.document).toStrictEqual({ ...body, loginId: '1' })
  })

  test.each([
    { name: 'AFRO' },
    { isPublic: true },
    { code: 20000000 },
    { password: 'password' },
  ])(
    'returns "200 OK" with JSON body (Update) if changed %p',
    async (diff: Partial<Database.UserSchema>) => {
      // Arrange
      const body: Database.UserSchema = {
        id: userToBeUpdated.id,
        name: userToBeUpdated.name,
        area: userToBeUpdated.area,
        isPublic: userToBeUpdated.isPublic,
        ...diff,
      }
      req.body = body
      mocked(getClientPrincipal).mockReturnValueOnce({
        identityProvider: 'github',
        userDetails: userToBeUpdated.id,
        userId: userToBeUpdated.loginId,
        userRoles: ['anonymous', 'authenticated'],
      })
      mocked(fetchUser).mockResolvedValueOnce(userToBeUpdated)

      // Act
      const result = await postUserInfo(null, req)

      // Assert
      expect(result.httpResponse.status).toBe(200)
      expect(result.httpResponse.body).toStrictEqual(body)
      expect(result.document).toStrictEqual({
        ...body,
        loginId: userToBeUpdated.loginId,
      })
    }
  )

  test('returns "400 BadRequest" if changed loginId', async () => {
    // Arrange
    req.body = {
      id: userToBeUpdated.id,
      name: userToBeUpdated.name,
      area: userToBeUpdated.area,
      isPublic: userToBeUpdated.isPublic,
    }
    mocked(getClientPrincipal).mockReturnValueOnce({
      identityProvider: 'github',
      userDetails: 'other_user',
      userId: '3',
      userRoles: ['anonymous', 'authenticated'],
    })
    mocked(fetchUser).mockResolvedValueOnce(userToBeUpdated)

    // Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "400 BadRequest" if changed id', async () => {
    // Arrange
    req.body = {
      id: 'update',
      name: userToBeUpdated.name,
      area: userToBeUpdated.area,
      isPublic: userToBeUpdated.isPublic,
    }
    mocked(getClientPrincipal).mockReturnValueOnce({
      identityProvider: 'github',
      userDetails: userToBeUpdated.id,
      userId: userToBeUpdated.loginId,
      userRoles: ['anonymous', 'authenticated'],
    })
    mocked(fetchLoginUser).mockResolvedValueOnce(userToBeUpdated)

    // Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test('returns "200 OK" but does not update if changed area', async () => {
    // Arrange
    const expected: Database.UserSchema = {
      id: userToBeUpdated.id,
      name: userToBeUpdated.name,
      area: userToBeUpdated.area,
      isPublic: userToBeUpdated.isPublic,
    }
    req.body = { ...expected, area: 14 }
    mocked(getClientPrincipal).mockReturnValueOnce({
      identityProvider: 'github',
      userDetails: userToBeUpdated.id,
      userId: userToBeUpdated.loginId,
      userRoles: ['anonymous', 'authenticated'],
    })
    mocked(fetchUser).mockResolvedValueOnce(userToBeUpdated)

    // Act
    const result = await postUserInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual(expected)
    expect(result.document).toStrictEqual(userToBeUpdated)
  })
})
