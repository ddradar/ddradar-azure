export type NotificationType = 'is-info' | 'is-warning'

/** DB schema of "Notification" container */
export type NotificationSchema = {
  id: string
  sender: 'SYSTEM'
  /** Show top page or not */
  pinned: boolean
  type: NotificationType
  /** Material Design Icon */
  icon: string
  title: string
  /** Markdown text */
  body: string
  /** UNIX time */
  timeStamp: number
}
