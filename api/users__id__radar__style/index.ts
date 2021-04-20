import type { Context, HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/** Get Groove Radar that match the specified user ID and play style. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers'>,
  [user]: Pick<Database.UserSchema, 'id' | 'isPublic'>[],
  radars: Api.GrooveRadarInfo[]
): Promise<ErrorResult<404> | SuccessResult<Api.GrooveRadarInfo[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (!user || (!user.isPublic && user.id !== loginUser?.id)) {
    return new ErrorResult(404)
  }

  const playStyle = bindingData.playStyle as 1 | 2 | undefined
  return new SuccessResult(
    radars
      .filter(r => !playStyle || r.playStyle === playStyle)
      .sort((l, r) => l.playStyle - r.playStyle) // ORDER BY Single, Double
  )
}
