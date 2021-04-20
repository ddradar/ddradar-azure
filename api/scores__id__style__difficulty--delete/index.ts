import type { HttpRequest } from '@azure/functions'
import type { Database } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, NoContentResult } from '../function'

type DeleteResult = {
  httpResponse: ErrorResult<404> | NoContentResult
  documents?: Database.ScoreSchema[]
}

/** Get course and orders information that match the specified ID. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers'>,
  scores: Database.ScoreSchema[]
): Promise<DeleteResult> {
  const user = await getLoginUserInfo(getClientPrincipal(req))
  if (!user) {
    return {
      httpResponse: new ErrorResult(404, 'User registration is not completed'),
    }
  }

  const userScores = scores.filter(s => s.userId === user.id)

  if (userScores.length === 0) {
    return { httpResponse: new ErrorResult(404) }
  }

  return {
    httpResponse: { status: 204 },
    documents: userScores.map(s => ({ ...s, ttl: 3600 })),
  }
}
