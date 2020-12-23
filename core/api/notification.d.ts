import type { NotificationSchema } from '../db/notification'

/**
 * Object type returned by `/api/v1/notification/{:id}`
 * @see https://github.com/ddradar/ddradar/tree/master/api/getNotificationInfo
 */
export type NotificationInfo = NotificationSchema

/**
 * Object type returned by `/api/v1/notification`
 * @see https://github.com/ddradar/ddradar/tree/master/api/getNotificationList
 */
export type NotificationListData = Omit<NotificationSchema, 'sender' | 'pinned'>

/**
 * Request body of POST `/api/v1/notification`
 * @see https://github.com/ddradar/ddradar/tree/master/api/postNotification
 */
export type NotificationBody = Partial<NotificationSchema> &
  Omit<NotificationSchema, 'id' | 'timeStamp'>
