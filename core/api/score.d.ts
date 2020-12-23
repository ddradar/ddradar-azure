import type { ScoreSchema } from '../db/scores'

/**
 * Object type returned by `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getChartScore
 */
export type ScoreInfo = Omit<ScoreSchema, 'isPublic' | 'radar'>

/**
 * Request body to `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/postChartScore
 */
export type ScoreBody = Pick<
  ScoreSchema,
  'score' | 'exScore' | 'maxCombo' | 'clearLamp' | 'rank'
>

/**
 * Request body to `/api/v1/scores/{:songId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/postSongScores
 */
export type ScoreListBody = Pick<
  ScoreSchema,
  | 'playStyle'
  | 'difficulty'
  | 'score'
  | 'exScore'
  | 'maxCombo'
  | 'clearLamp'
  | 'rank'
> & { topScore?: number }
