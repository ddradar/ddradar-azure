import type { Api, Database } from '@ddradar/core'

import { Condition, fetchList, fetchOne } from '.'

export function fetchUser(id: string): Promise<Database.UserSchema | null> {
  return fetchOne(
    'Users',
    ['id', 'loginId', 'name', 'area', 'code', 'isPublic'] as const,
    [{ condition: 'c.id = @', value: id }]
  )
}

export function fetchLoginUser(
  loginId: string
): Promise<Database.UserSchema | null> {
  return fetchOne(
    'Users',
    ['id', 'loginId', 'name', 'area', 'code', 'isPublic', 'password'],
    [{ condition: 'c.loginId = @', value: loginId }]
  )
}

export function fetchUserList(
  loginId: string,
  area?: Database.AreaCode,
  name?: string,
  code?: number
): Promise<Api.UserInfo[]> {
  const columns = ['id', 'name', 'area', 'code'] as const
  const cond: Condition[] = [
    { condition: '(c.isPublic = true OR c.loginId = @)', value: loginId },
  ]
  if (area !== undefined) cond.push({ condition: 'c.area = @', value: area })
  if (name) cond.push({ condition: 'CONTAINS(c.name, @, true)', value: name })
  if (code) cond.push({ condition: 'c.code = @', value: code })
  cond.push({ condition: 'IS_DEFINED(c.loginId)' })
  return fetchList<'Users', Api.UserInfo>('Users', columns, cond, {
    name: 'ASC',
  })
}
