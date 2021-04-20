import type { Database } from '@ddradar/core'

import { canConnectDB, getContainer } from '..'
import { fetchLoginUser, fetchUser, fetchUserList } from '../users'
import { describeIf } from './util'

describeIf(canConnectDB)('users.ts', () => {
  const users: Required<Database.UserSchema>[] = [...Array(100).keys()].map(
    i => ({
      id: `user_${i}`,
      loginId: `login_${i}`,
      name: `User ${i}`,
      area: (i % 50) as Database.AreaCode,
      isPublic: i !== 0,
      code: 10000000 + i,
      password: `pass_${i}`,
    })
  )
  /** System users */
  const areas: Database.UserSchema[] = [...Array(50).keys()].map(i => ({
    id: `${i}`,
    name: `User ${i}`,
    area: (i % 50) as Database.AreaCode,
    isPublic: true,
  }))
  beforeAll(async () => {
    await Promise.all(users.map(u => getContainer('Users').items.create(u)))
    await Promise.all(areas.map(u => getContainer('Users').items.create(u)))
  })
  afterAll(async () => {
    await Promise.all(
      users.map(u => getContainer('Users').item(u.id, u.id).delete())
    )
    await Promise.all(
      areas.map(u => getContainer('Users').item(u.id, u.id).delete())
    )
  })

  describe('fetchUser', () => {
    test.each(['', 'foo', users[0].loginId, users[1].loginId])(
      '("%s") returns null',
      async id => {
        // Arrange - Act
        const user = await fetchUser(id)

        // Assert
        expect(user).toBeNull()
      }
    )

    test.each([
      [users[0].id, users[0]],
      [users[1].id, users[1]],
    ])('("%s") returns %p', async (id, user) => {
      // Arrange - Act
      const expected: Database.UserSchema = { ...user }
      delete expected.password
      const result = await fetchUser(id)

      // Assert
      expect(result).toStrictEqual(expected)
    })
  })

  describe('fetchLoginUser', () => {
    test.each(['', 'foo', users[0].id, users[1].id])(
      '("%s") returns null',
      async loginId => {
        // Arrange - Act
        const user = await fetchLoginUser(loginId)

        // Assert
        expect(user).toBeNull()
      }
    )

    test.each([
      [users[0].loginId, users[0]],
      [users[1].loginId, users[1]],
    ])('("%s") returns %p', async (loginId, expected) => {
      // Arrange - Act
      const user = await fetchLoginUser(loginId)

      // Assert
      expect(user).toStrictEqual(expected)
    })
  })

  describe('fetchUserList', () => {
    test('("", undefined, "0") returns 9 users', async () => {
      // Arrange - Act
      const result = await fetchUserList('', undefined, '0')

      // Assert
      expect(result).toHaveLength(9)
    })

    test(`("${users[0].loginId}", undefined, "0") returns 10 users`, async () => {
      // Arrange - Act
      const result = await fetchUserList(users[0].loginId, undefined, '0')

      // Assert
      expect(result).toHaveLength(10)
    })

    test(`("", 13) returns 1 user`, async () => {
      // Arrange - Act
      const result = await fetchUserList('', 13)

      // Assert
      expect(result).toHaveLength(2)
    })

    test.each([
      [
        undefined,
        10000010,
        {
          id: users[10].id,
          name: users[10].name,
          area: users[10].area,
          code: users[10].code,
        },
      ],
      [
        'User 2',
        10000023,
        {
          id: users[23].id,
          name: users[23].name,
          area: users[23].area,
          code: users[23].code,
        },
      ],
    ])(
      '("", undefined, "%s", %i) returns [%p]',
      async (name, code, expected) => {
        // Arrange - Act
        const result = await fetchUserList('', undefined, name, code)

        // Assert
        expect(result).toHaveLength(1)
        expect(result[0]).toStrictEqual(expected)
      }
    )
  })
})
