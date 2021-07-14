export type NotificationType = 'is-info' | 'is-warning'

/**
 * DB schema of "Notification" container
 * @example
 * {
 *   "id": "<Auto Generated>",
 *   "sender": "SYSTEM",
 *   "pinned": true,
 *   "type": "is-info",
 *   "icon": "info",
 *   "title": "このサイトはベータ版です",
 *   "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *   "timeStamp": 1597028400
 * }
 */
export type NotificationSchema = {
  /** Auto Generated */
  id: string
  /** `SYSTEM`: global notification */
  sender: 'SYSTEM'
  /** Show top page or not */
  pinned: boolean
  /** @see https://buefy.org/documentation/message#types */
  type: NotificationType
  /** Material Design Icon */
  icon: string
  title: string
  /** Markdown text */
  body: string
  /** UNIX time */
  timeStamp: number
}
