import type {
  NotificationInfo,
  NotificationListData,
} from '@core/api/notification'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

/**
 * Call "Get Notification List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/notification/
 */
export function getNotificationList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  topOnly?: boolean
) {
  const query = topOnly ? '?scope=top' : ''
  return $http.$get<NotificationListData[]>(`${apiPrefix}/notification${query}`)
}

/**
 * Call "Get Notification Info" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/notification__id/
 */
export function getNotificationInfo(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<NotificationInfo>(`${apiPrefix}/notification/${id}`)
}
