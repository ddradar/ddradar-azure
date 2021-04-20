import type { ItemDefinition } from '@azure/cosmos'
import type { Database } from '@ddradar/core'
import { fetchSummeryClearLampCount, fetchSummeryRankCount } from '@ddradar/db'

type UserDetailSchema = Database.ClearStatusSchema | Database.ScoreStatusSchema

export default async function (
  _context: unknown,
  _launchTimer: unknown,
  oldSummeries: (UserDetailSchema & ItemDefinition)[]
): Promise<UserDetailSchema[]> {
  const newClearLampCounts = await fetchSummeryClearLampCount()
  const newRankCounts = await fetchSummeryRankCount()
  const notExists = oldSummeries.filter(
    o =>
      !newClearLampCounts.find(
        d =>
          o.userId === d.userId &&
          o.type === d.type &&
          o.playStyle === d.playStyle &&
          o.level === d.level &&
          o.clearLamp === d.clearLamp
      ) &&
      !newRankCounts.find(
        d =>
          o.userId === d.userId &&
          o.type === d.type &&
          o.playStyle === d.playStyle &&
          o.level === d.level &&
          o.rank === d.rank
      )
  )

  return [
    ...newClearLampCounts.map(
      d =>
        ({
          id: oldSummeries.find(
            o =>
              o.userId === d.userId &&
              o.type === d.type &&
              o.playStyle === d.playStyle &&
              o.level === d.level &&
              o.clearLamp === d.clearLamp
          )?.id,
          ...d,
        } as Database.ClearStatusSchema)
    ),
    ...newRankCounts.map(
      d =>
        ({
          id: oldSummeries.find(
            o =>
              o.userId === d.userId &&
              o.type === d.type &&
              o.playStyle === d.playStyle &&
              o.level === d.level &&
              o.rank === d.rank
          )?.id,
          ...d,
        } as Database.ScoreStatusSchema)
    ),
    ...notExists.map(d => ({ ...d, count: 0 })),
  ]
}
