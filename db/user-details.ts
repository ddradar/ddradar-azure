import type { ItemDefinition } from '@azure/cosmos'
import type { Database, Song } from '@ddradar/core'

import { getContainer } from '.'

export async function generateGrooveRadar(
  userId: string,
  playStyle: Song.PlayStyle
): Promise<Database.GrooveRadarSchema> {
  const container = getContainer('Scores')
  const columns: (keyof Database.GrooveRadarSchema)[] = [
    'stream',
    'voltage',
    'air',
    'freeze',
    'chaos',
  ]
  const column = columns.map(c => `MAX(c.radar.${c}) AS ${c}`).join(', ')
  const { resources } = await container.items
    .query<Database.GrooveRadarSchema>({
      query:
        `SELECT c.userId, "radar" AS type, c.playStyle, ${column} ` +
        'FROM c ' +
        'WHERE c.userId = @id ' +
        'AND c.playStyle = @playStyle ' +
        'AND IS_DEFINED(c.radar) ' +
        'AND ((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null) ' +
        'GROUP BY c.userId, c.playStyle',
      parameters: [
        { name: '@id', value: userId },
        { name: '@playStyle', value: playStyle },
      ],
    })
    .fetchAll()
  const result: Database.GrooveRadarSchema & ItemDefinition = resources[0] ?? {
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
  const container = getContainer('UserDetails')
  const { resources } = await container.items
    .query<Database.ClearStatusSchema | Database.ScoreStatusSchema>({
      query:
        'SELECT * FROM c ' +
        'WHERE c.userId = @id ' +
        'AND c.type = "clear" OR c.type = "score"',
      parameters: [{ name: '@id', value: userId }],
    })
    .fetchAll()
  return resources
}
