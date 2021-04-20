import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'
import { Score } from '@ddradar/core'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

type TotalCount = Omit<Api.ScoreStatus, 'rank'>

/** Get Score statuses that match the specified user ID, play style and level. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  [user]: Pick<Database.UserSchema, 'id' | 'isPublic'>[],
  scoreStatuses: Api.ScoreStatus[],
  totalCounts: TotalCount[]
): Promise<ErrorResult<404> | SuccessResult<Api.ScoreStatus[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))

  // User is not found or private
  if (!user || (!user.isPublic && user.id !== loginUser?.id)) {
    return new ErrorResult(404)
  }

  const playStyle = parseInt(req.query.playStyle ?? '', 10)
  const isValidPlayStyle = playStyle === 1 || playStyle === 2
  const level = parseInt(req.query.level ?? '', 10)
  const isValidLevel = Number.isInteger(level) && level >= 1 && level <= 19

  const danceLevels = [...Score.danceLevelSet]
  return new SuccessResult(
    totalCounts
      .filter(
        r =>
          (!isValidPlayStyle || playStyle === r.playStyle) &&
          (!isValidLevel || level === r.level)
      )
      .flatMap(d => {
        const filtered = scoreStatuses.filter(
          r => r.playStyle === d.playStyle && r.level === d.level
        )
        const playedCount = filtered.reduce(
          (prev, curr) => prev + curr.count,
          0
        )
        return [
          ...filtered,
          { ...d, rank: '-' as const, count: d.count - playedCount },
        ]
      })
      .sort((l, r) =>
        l.playStyle !== r.playStyle
          ? l.playStyle - r.playStyle
          : l.level !== r.level
          ? l.level - r.level
          : danceLevels.findIndex(s => l.rank === s) -
            danceLevels.findIndex(s => r.rank === s)
      ) // ORDER BY playStyle, level, rank ASC
  )
}
