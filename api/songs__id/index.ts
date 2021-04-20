import type { Context } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

/** Get song and charts information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [song]: Api.SongInfo[]
): Promise<ErrorResult<404> | SuccessResult<Api.SongInfo>> {
  if (!song) {
    return new ErrorResult(404, `Not found song that id: "${bindingData.id}"`)
  }

  return new SuccessResult(song)
}
