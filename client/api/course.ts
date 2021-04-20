import type { Api } from '@ddradar/core'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

export function getCourseType(type: number) {
  return type === 1 ? 'NONSTOP' : type === 2 ? '段位認定' : ''
}

/**
 * Call "Get Course List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/courses/
 */
export function getCourseList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  series?: 16 | 17,
  type?: 1 | 2
) {
  const searchParams = new URLSearchParams()
  if (series) searchParams.append('series', `${series}`)
  if (type) searchParams.append('type', `${type}`)
  return $http.$get<Api.CourseListData[]>(`${apiPrefix}/courses`, {
    searchParams,
  })
}

/**
 * Call "Get Course Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/courses__id/
 */
export function getCourseInfo(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<Api.CourseInfo>(`${apiPrefix}/courses/${id}`)
}
