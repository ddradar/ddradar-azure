import type { ScoreSchema } from './scores'
import type { GrooveRadar, StepChartSchema } from './songs'

/**
 * Summary of {@link GrooveRadar} (included in "UserDetails" container)
 * @example
 * {
 *   "userId": "user_1",
 *   "type": "radar",
 *   "playStyle": 1,
 *   "stream": 100,
 *   "voltage": 100,
 *   "air": 100,
 *   "freeze": 100,
 *   "chaos": 100
 * }
 */
export type GrooveRadarSchema = Pick<StepChartSchema, 'playStyle'> &
  Pick<ScoreSchema, 'userId'> & {
    /** User details type */
    type: 'radar'
  } & GrooveRadar

/**
 * Summary of ClearLamp (included in "UserDetails" container)
 * @example
 * {
 *   "userId": "user_1",
 *   "type": "clear",
 *   "playStyle": 1,
 *   "level": 5,
 *   "clearLamp": 6,
 *   "count": 53
 * }
 */
export type ClearStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'clearLamp'
> & {
  /** User details type */
  type: 'clear'
  count: number
}

/**
 * Summary of DanceLevel (included in "UserDetails" container)
 * @example
 * {
 *   "userId": "user_1",
 *   "type": "clear",
 *   "playStyle": 1,
 *   "level": 5,
 *   "rank": "AAA",
 *   "count": 53
 * }
 */
export type ScoreStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'rank'
> & {
  /** User details type */
  type: 'score'
  count: number
}
