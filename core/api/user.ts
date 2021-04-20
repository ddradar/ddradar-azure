import type { ClearLamp, DanceLevel } from '../db/scores'
import type {
  ClearStatusSchema,
  GrooveRadarSchema,
  ScoreStatusSchema,
} from '../db/userDetails'
import type { UserSchema } from '../db/users'

/**
 * Object type returned by `/api/v1/user`
 * @see https://github.com/ddradar/ddradar/blob/master/api/user--get/
 */
export type CurrentUserInfo = Omit<UserSchema, 'loginId'>

/**
 * Object type returned by `/api/v1/users` and `/api/v1/users/{:id}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__id/
 * @see https://github.com/ddradar/ddradar/blob/master/api/users/
 */
export type UserInfo = Omit<UserSchema, 'loginId' | 'isPublic' | 'password'>

/**
 * Object type returned by `/api/v1/users/exists/{:id}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__exists__id/
 */
export type ExistsUser = Pick<UserSchema, 'id'> & { exists: boolean }

/**
 * Object type returned by `/api/v1/users/{:id}/clear`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__id__clear/
 */
export type ClearStatus = Pick<
  ClearStatusSchema,
  'playStyle' | 'level' | 'count'
> & {
  clearLamp: ClearLamp | -1
}

/**
 * Object type returned by `/api/v1/users/{:id}/score`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__id__score/
 */
export type ScoreStatus = Pick<
  ScoreStatusSchema,
  'playStyle' | 'level' | 'count'
> & {
  rank: DanceLevel | '-'
}

/**
 * Object type returned by `/api/v1/users/{:id}/radar/{:playStyle}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__id__radar__style/
 */
export type GrooveRadarInfo = Omit<GrooveRadarSchema, 'userId' | 'type'>
