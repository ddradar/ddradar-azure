import type { Api } from '@ddradar/core'

export const notificationList: Api.NotificationListData[] = [
  {
    id: 'foo',
    icon: 'account',
    type: 'is-info',
    title: 'Title 1',
    body: '- Message Body1\n - Message Body2',
    timeStamp: 1597244400, // 2020/8/13
  },
  {
    id: 'bar',
    icon: '',
    type: 'is-info',
    title: 'Title 2',
    body: '- [Message Body2](./link)',
    timeStamp: 1597244400, // 2020/8/13
  },
]
