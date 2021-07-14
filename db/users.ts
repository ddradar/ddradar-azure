import type { Api, Database } from '@ddradar/core'

import type { Condition } from './database'
import { fetchList, fetchOne } from './database'

export function fetchUser(id: string): Promise<Database.UserSchema | null> {
  return fetchOne(
    'Users',
    ['id', 'loginId', 'name', 'area', 'code', 'isPublic'],
    { condition: 'c.id = @', value: id }
  )
}

export function fetchLoginUser(
  loginId: string
): Promise<Database.UserSchema | null> {
  return fetchOne(
    'Users',
    ['id', 'loginId', 'name', 'area', 'code', 'isPublic', 'password'],
    { condition: 'c.loginId = @', value: loginId }
  )
}

export function fetchUserList(
  loginId: string,
  area?: Database.AreaCode,
  name?: string,
  code?: number
): Promise<Api.UserInfo[]> {
  const cond: Condition[] = [
    { condition: 'IS_DEFINED(c.loginId)' },
    { condition: '(c.isPublic = true OR c.loginId = @)', value: loginId },
  ]
  if (area !== undefined) cond.push({ condition: 'c.area = @', value: area })
  if (name) cond.push({ condition: 'CONTAINS(c.name, @, true)', value: name })
  if (code) cond.push({ condition: 'c.code = @', value: code })

  return fetchList('Users', ['id', 'name', 'area', 'code'], cond, {
    name: 'ASC',
  })
}
