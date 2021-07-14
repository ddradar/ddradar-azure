import type { ScoreSchema } from '../db/scores'
import { isScore } from '../score'
import { difficultyMap, playStyleMap } from '../song'
import { hasIntegerProperty, hasProperty } from '../typeUtils'

/**
 * Object type returned by `/api/v1/scores/{:userId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/scores__uid/
 */
export type ScoreList = Omit<
  ScoreSchema,
  'userId' | 'userName' | 'isPublic' | 'radar'
> & {
  isCourse: boolean
}

/**
 * Object type returned by `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/scores__id__style__difficulty--get/
 */
export type ScoreInfo = Omit<ScoreSchema, 'isPublic' | 'radar'>

/**
 * Request body to `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/scores__id__style__difficulty--post/
 */
export type ScoreBody = Pick<
  ScoreSchema,
  'score' | 'exScore' | 'maxCombo' | 'clearLamp' | 'rank'
>

/**
 * Request body to `/api/v1/scores/{:songId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/scores__id--post/
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
> & {
  /** World Record score */
  topScore?: number
}

/** Type assertion of {@link ScoreListBody} */
export function isScoreListBody(obj: unknown): obj is ScoreListBody {
  return (
    isScore(obj) &&
    hasIntegerProperty(obj, 'playStyle', 'difficulty') &&
    (playStyleMap as ReadonlyMap<number, string>).has(obj.playStyle) &&
    (difficultyMap as ReadonlyMap<number, string>).has(obj.difficulty) &&
    (!hasProperty(obj, 'topScore') || hasIntegerProperty(obj, 'topScore'))
  )
}
