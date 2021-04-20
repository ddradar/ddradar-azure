import type { Context } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

/** Get notification that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [notification]: Api.NotificationInfo[]
): Promise<ErrorResult<404> | SuccessResult<Api.NotificationInfo>> {
  if (!notification) {
    return new ErrorResult(404, `Not found course that id: "${bindingData.id}"`)
  }

  return new SuccessResult(notification)
}
