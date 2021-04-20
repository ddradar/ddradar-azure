import type { Context } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

/** Get charts that match the specified conditions. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  documents: Api.ChartInfo[]
): Promise<ErrorResult<404> | SuccessResult<Api.ChartInfo[]>> {
  if (documents.length === 0) {
    const message = `Not found chart that {playStyle: ${bindingData.playStyle}, level: ${bindingData.level}}`
    return new ErrorResult(404, message)
  }
  return new SuccessResult(documents)
}
