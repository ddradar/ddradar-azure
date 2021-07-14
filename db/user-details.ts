import type { ItemDefinition } from '@azure/cosmos'
import type { Database, Song } from '@ddradar/core'

import { fetchGroupedList, fetchList } from './database'

export async function generateGrooveRadar(
  userId: string,
  playStyle: Song.PlayStyle
): Promise<Database.GrooveRadarSchema> {
  const resources: Database.GrooveRadarSchema[] = await fetchGroupedList(
    'Scores',
    [
      'userId',
      '"radar" AS type',
      'playStyle',
      'MAX(c.radar.stream) AS stream',
      'MAX(c.radar.voltage) AS voltage',
      'MAX(c.radar.air) AS air',
      'MAX(c.radar.freeze) AS freeze',
      'MAX(c.radar.chaos) AS chaos',
    ],
    [{ condition: 'c.userId = @', value: userId }],
    ['userId', 'playStyle']
  )
  const result: Database.GrooveRadarSchema & Pick<ItemDefinition, 'id'> =
    resources[0] ?? {
      userId,
      type: 'radar',
      playStyle,
      stream: 0,
      voltage: 0,
      air: 0,
      freeze: 0,
      chaos: 0,
    }
  result.id = `radar-${userId}-${playStyle}`
  return result
}

export async function fetchClearAndScoreStatus(
  userId: string
): Promise<(Database.ClearStatusSchema | Database.ScoreStatusSchema)[]> {
  return fetchList(
    'UserDetails',
    '*',
    [
      { condition: 'c.userId = @', value: userId },
      { condition: 'c.type = "clear" OR c.type = "score"' },
    ],
    { _ts: 'DESC' }
  ) as Promise<(Database.ClearStatusSchema | Database.ScoreStatusSchema)[]>
}
