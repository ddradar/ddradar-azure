import type { ItemDefinition } from '@azure/cosmos'
import type { Database, Song } from '@ddradar/core'

import type { Condition } from './database'
import { fetchGroupedList, fetchList, fetchOne } from './database'

export function fetchScore(
  userId: string,
  songId: string,
  playStyle: Song.PlayStyle,
  difficulty: Song.Difficulty
): Promise<(Database.ScoreSchema & Pick<ItemDefinition, 'id'>) | null> {
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
    { condition: 'c.userId = @', value: userId },
    { condition: 'c.songId = @', value: songId },
    { condition: 'c.playStyle = @', value: playStyle },
    { condition: 'c.difficulty = @', value: difficulty },
    { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' }
  )
}

export function fetchScoreList(
  userId: string,
  conditions: Partial<
    Pick<
      Database.ScoreSchema,
      'playStyle' | 'difficulty' | 'level' | 'clearLamp' | 'rank'
    >
  > = {},
  includeCourse = false
): Promise<Omit<Database.ScoreSchema, 'userId' | 'userName' | 'isPublic'>[]> {
  const condition: Condition[] = [
    { condition: 'c.userId = @', value: userId },
    { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
    ...Object.entries(conditions).map(([k, v]) => ({
      condition: `c.${k} = @`,
      value: v,
    })),
  ]
  if (!includeCourse) condition.push({ condition: 'IS_DEFINED(c.radar)' })

  return fetchList(
    'Scores',
    [
      'songId',
      'songName',
      'playStyle',
      'difficulty',
      'level',
      'score',
      'exScore',
      'maxCombo',
      'clearLamp',
      'rank',
      'radar',
      'deleted',
    ],
    condition,
    { songName: 'ASC' }
  )
}

export function fetchSummaryClearLampCount(): Promise<
  Database.ClearStatusSchema[]
> {
  return fetchGroupedList(
    'Scores',
    [
      'userId',
      '"score" AS type',
      'playStyle',
      'level',
      'clearLamp',
      'COUNT(1) AS count',
    ],
    [
      { condition: 'IS_DEFINED(c.radar)' },
      { condition: 'NOT IS_DEFINED(c.ttl)' },
      { condition: 'NOT (IS_DEFINED(c.deleted) AND c.deleted = true)' },
    ],
    ['userId', 'playStyle', 'level', 'clearLamp']
  )
}

export function fetchSummaryRankCount(): Promise<Database.ScoreStatusSchema[]> {
  return fetchGroupedList(
    'Scores',
    [
      'userId',
      '"score" AS type',
      'playStyle',
      'level',
      'rank',
      'COUNT(1) AS count',
    ],
    [
      { condition: 'IS_DEFINED(c.radar)' },
      { condition: 'NOT IS_DEFINED(c.ttl)' },
      { condition: 'NOT (IS_DEFINED(c.deleted) AND c.deleted = true)' },
    ],
    ['userId', 'playStyle', 'level', 'rank']
  )
}
