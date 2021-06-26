import type { ItemDefinition } from '@azure/cosmos'
import type { Database, Song } from '@ddradar/core'

import { fetchOne, getContainer } from '.'

export function fetchScore(
  userId: string,
  songId: string,
  playStyle: Song.PlayStyle,
  difficulty: Song.Difficulty
): Promise<(Database.ScoreSchema & ItemDefinition) | null> {
  return fetchOne(
    'Scores',
    [
      'id',
      'userId',
      'userName',
      'isPublic',
      'songId',
      'songName',
      'playStyle',
      'difficulty',
      'level',
      'clearLamp',
      'score',
      'rank',
      'exScore',
      'maxCombo',
      'radar',
    ],
    [
      { condition: 'c.userId = @', value: userId },
      { condition: 'c.songId = @', value: songId },
      { condition: 'c.playStyle = @', value: playStyle },
      { condition: 'c.difficulty = @', value: difficulty },
      { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
    ]
  )
}

const sumTarget =
  'WHERE IS_DEFINED(c.radar) AND (NOT IS_DEFINED(c.ttl)) AND (c.deleted ?? false) != true '

export async function fetchSummeryClearLampCount(): Promise<
  Database.ClearStatusSchema[]
> {
  const container = getContainer('Scores')

  const { resources } = await container.items
    .query<Database.ClearStatusSchema>(
      'SELECT c.userId, "clear" AS type, c.playStyle, c.level, c.clearLamp, COUNT(1) AS count FROM c ' +
        sumTarget +
        'GROUP BY c.userId, c.playStyle, c.level, c.clearLamp'
    )
    .fetchAll()

  return resources
}

export async function fetchSummeryRankCount(): Promise<
  Database.ScoreStatusSchema[]
> {
  const container = getContainer('Scores')

  const { resources } = await container.items
    .query<Database.ScoreStatusSchema>(
      'SELECT c.userId, "score" AS type, c.playStyle, c.level, c.rank, COUNT(1) AS count FROM c ' +
        sumTarget +
        'GROUP BY c.userId, c.playStyle, c.level, c.rank'
    )
    .fetchAll()

  return resources
}
