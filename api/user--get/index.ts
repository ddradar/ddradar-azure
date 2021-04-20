import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/** Get information about the currently logged in user. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>
): Promise<ErrorResult<404> | SuccessResult<Api.CurrentUserInfo>> {
  const user = await getLoginUserInfo(getClientPrincipal(req))

  if (!user) {
    return new ErrorResult(404, 'User registration is not completed')
  }
  delete user.loginId

  return new SuccessResult(user)
}
