import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import type { UserSchema } from '../db'
import type { GrooveRadarSchema } from '../db/user-details'
import getGrooveRadar from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}/radar', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  const publicUser: UserSchema = {
    id: 'public_user',
    loginId: '1',
    name: 'Public User',
    area: 13,
    code: 10000000,
    isPublic: true,
  }
  const privateUser: UserSchema = {
    id: 'private_user',
    loginId: '2',
    name: 'Private User',
    area: 0,
    isPublic: false,
  }
  const radar = { stream: 100, voltage: 100, air: 100, freeze: 100, chaos: 100 }
  const radars: Omit<GrooveRadarSchema, 'userId' | 'type'>[] = [
    { ...radar, playStyle: 2 },
    { ...radar, playStyle: 1 },
  ]

  const req = { headers: {} }
  beforeEach(() => (context.bindingData = {}))

  test('/foo/radar returns "404 Not Found"', async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getGrooveRadar(context, req, [], [])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${privateUser.id}/radar returns "404 Not Found"`, async () => {
    // Arrange
    context.bindingData.id = privateUser.id

    // Act
    const result = await getGrooveRadar(context, req, [privateUser], radars)

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${publicUser.id}/radar returns "200 OK" with JSON body`, async () => {
    // Arrange
    context.bindingData.id = publicUser.id

    // Act
    const result = await getGrooveRadar(context, req, [publicUser], radars)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual([radars[1], radars[0]])
  })

  test.each([
    [1, radars[1]],
    [2, radars[0]],
  ])(
    `${publicUser.id}/radar/%i returns "200 OK" with [%p]`,
    async (playStyle, expected) => {
      // Arrange
      context.bindingData.id = publicUser.id
      context.bindingData.playStyle = playStyle

      // Act
      const result = await getGrooveRadar(context, req, [publicUser], radars)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toStrictEqual([expected])
    }
  )

  test(`/${privateUser.id}/radar returns "200 OK" with JSON body`, async () => {
    // Arrange
    context.bindingData.id = privateUser.id
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)

    // Act
    const result = await getGrooveRadar(context, req, [privateUser], radars)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual([radars[1], radars[0]])
  })
})