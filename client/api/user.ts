import type { Api } from '@ddradar/core'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

/**
 * Call "User Exists" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/user__exists__id/
 */
export async function existsUser(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  const { exists } = await $http.$get<Api.ExistsUser>(
    `${apiPrefix}/user/exists/${id}`
  )
  return exists
}

/**
 * Call "Get Current User Data" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/user--get/
 */
export function getCurrentUser($http: Pick<NuxtHTTPInstance, '$get'>) {
  return $http.$get<Api.CurrentUserInfo>(`${apiPrefix}/user`)
}

/**
 * Call "Get User List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/users/
 */
export function getUserList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  name?: string,
  area?: number,
  code?: number
) {
  const searchParams = new URLSearchParams()
  if (name) searchParams.append('name', name)
  if (area) searchParams.append('area', `${area}`)
  if (code) searchParams.append('code', `${code}`)
  return $http.$get<Api.UserInfo[]>(`${apiPrefix}/users`, { searchParams })
}

/**
 * Call "Get User Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/users__id/
 */
export function getUserInfo($http: Pick<NuxtHTTPInstance, '$get'>, id: string) {
  return $http.$get<Api.UserInfo>(`${apiPrefix}/users/${id}`)
}

/**
 * Call "Get Clear Status" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/users__id__clear/
 */
export function getClearStatus(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  userId: string,
  playStyle: 1 | 2
) {
  return $http.$get<Api.ClearStatus[]>(
    `${apiPrefix}/users/${userId}/clear?playStyle=${playStyle}`
  )
}

/**
 * Call "Get Score Status" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/users__id__score/
 */
export function getScoreStatus(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  userId: string,
  playStyle: 1 | 2
) {
  return $http.$get<Api.ScoreStatus[]>(
    `${apiPrefix}/users/${userId}/score?playStyle=${playStyle}`
  )
}

/**
 * Call "Get Groove Radar" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/users__id__radar__style/
 */
export function getGrooveRadar(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  userId: string,
  playStyle: 1 | 2
) {
  return $http.$get<Api.GrooveRadarInfo[]>(
    `${apiPrefix}/users/${userId}/radar/${playStyle}`
  )
}

/**
 * Call "Post User Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/user--post/
 */
export function postUserInfo(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  user: Api.CurrentUserInfo
) {
  return $http.$post<Api.CurrentUserInfo>(`${apiPrefix}/user`, user)
}
