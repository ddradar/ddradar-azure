import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
  Unwrap,
} from '../typeUtils'

export type UserSchema = {
  /** User ID */
  id: string
  /**
   * Auto generated by Azure Authentication.
   * Not defined for DDRadar's system users, like area top.
   */
  loginId?: string
  name: string
  area: AreaCode
  /** DDR Code */
  code?: number
  /** `true` if this user info is public, otherwize `false`. */
  isPublic: boolean
  /** Use for external API. */
  password?: string
}

export function isUserSchema(obj: unknown): obj is UserSchema {
  return (
    hasStringProperty(obj, 'id', 'name') &&
    /^[-a-zA-Z0-9_]+$/.test(obj.id) &&
    hasIntegerProperty(obj, 'area') &&
    (areaCodeSet as ReadonlySet<number>).has(obj.area) &&
    (!hasProperty(obj, 'code') ||
      (hasIntegerProperty(obj, 'code') &&
        obj.code >= 10000000 &&
        obj.code <= 99999999)) &&
    hasProperty(obj, 'isPublic') &&
    typeof obj.isPublic === 'boolean' &&
    (!hasProperty(obj, 'password') || hasStringProperty(obj, 'password'))
  )
}

const areaCodes = new Set([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 106, 107, 108, 109, 110,
  111, 112, 113, 114, 115, 116, 117, 118,
] as const)
export type AreaCode = Unwrap<typeof areaCodes>
export const areaCodeSet: ReadonlySet<AreaCode> = areaCodes
