import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type TotalCount = Omit<Api.ClearStatus, 'clearLamp'>

/** Get Clear status that match the specified user ID and play style. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  [user]: Pick<Database.UserSchema, 'id' | 'isPublic'>[],
  clearStatuses: Api.ClearStatus[],
  totalCounts: TotalCount[]
): Promise<ErrorResult<404> | SuccessResult<Api.ClearStatus[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (!user || (!user.isPublic && user.id !== loginUser?.id)) {
    return new ErrorResult(404)
  }

  const playStyle = parseInt(req.query.playStyle ?? '', 10)
  const isValidPlayStyle = playStyle === 1 || playStyle === 2
  const level = parseInt(req.query.level ?? '', 10)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= 20

  return new SuccessResult(
    totalCounts
      .filter(
        r =>
          (!isValidPlayStyle || playStyle === r.playStyle) &&
          (!isValidLevel || level === r.level)
      )
      .flatMap(d => {
        const filtered = clearStatuses.filter(
          r => r.playStyle === d.playStyle && r.level === d.level
        )
        const playedCount = filtered.reduce((p, c) => p + c.count, 0)
        return [
          ...filtered,
          { ...d, clearLamp: -1 as const, count: d.count - playedCount },
        ]
      })
      .sort((l, r) =>
        l.playStyle !== r.playStyle
          ? l.playStyle - r.playStyle
          : l.level !== r.level
          ? l.level - r.level
          : l.clearLamp - r.clearLamp
      ) // ORDER BY playStyle, level, clearLamp ASC
  )
}
