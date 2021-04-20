import type { Context } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { SuccessResult } from '../function'

/** Returns whether the specified user exists. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [user]: unknown[]
): Promise<SuccessResult<Api.ExistsUser>> {
  return new SuccessResult({ id: bindingData.id, exists: !!user })
}
