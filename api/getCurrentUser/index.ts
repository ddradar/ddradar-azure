import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import type { UserSchema } from '../db/users'
import type { NotFoundResult, SuccessResult } from '../function'

/** Get information about the currently logged in user. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>
): Promise<NotFoundResult | SuccessResult<Omit<UserSchema, 'loginId'>>> {
  const user = await getLoginUserInfo(getClientPrincipal(req))

  if (!user) {
    return { status: 404, body: 'User registration is not completed' }
  }
  delete user.loginId

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: user,
  }
}
