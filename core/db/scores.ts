import type { ScoreBody } from '../api/score'
import { calcMyGrooveRadar } from '../score'
import { hasIntegerProperty, Unwrap } from '../typeUtils'
import type {
  CourseChartSchema,
  CourseSchema,
  SongSchema,
  StepChartSchema,
} from './songs'
import type { UserSchema } from './users'
import { isAreaUser } from './users'

/**
 * DB schema of "Scores" container
 * @example
 * {
 *   "userId": "some_user1",
 *   "userName": "User1",
 *   "isPublic": true,
 *   "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *   "songName": "愛言葉",
 *   "playStyle": 1,
 *   "difficulty": 0,
 *   "level": 3,
 *   "score": 1000000,
 *   "exScore": 402,
 *   "maxCombo": 122,
 *   "clearLamp": 7,
 *   "rank": "AAA",
 *   "radar": {
 *     "stream": 21,
 *     "voltage": 22,
 *     "air": 7,
 *     "freeze": 26,
 *     "chaos": 0
 *   }
 * }
 */
export type ScoreSchema = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level'
> & {
  /**
   * {@link UserSchema.id}
   * @description This property is the partition key.
   */
  userId: string
  /** {@link UserSchema.name} */
  userName: string
  /** `true` if this score is public, otherwize `false`. */
  isPublic: boolean
  /** {@link SongSchema.id} */
  songId: string
  /** {@link SongSchema.name} */
  songName: string
  /** Normal score (0-1000000) */
  score: number
  exScore?: number
  maxCombo?: number
  /** @see {@link ClearLamp} */
  clearLamp: ClearLamp
  /** Clear rank (`"E"`～`"AAA"`) */
  rank: DanceLevel
  /** My Groove Radar (only user & song score) */
  radar?: Pick<
    StepChartSchema,
    'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
  >
  /**
   * Song (or course) is deleted or not.
   * If `true`, this score is not counted on UserDetails.
   */
  deleted?: boolean
}

const clearLamps = new Map([
  [0, 'Failed'],
  [1, 'Assisted Clear'],
  [2, 'Clear'],
  [3, 'Life 4'],
  [4, 'Full Combo'],
  [5, 'Great Full Combo'],
  [6, 'Perfect Full Combo'],
  [7, 'Marvelous Full Combo'],
] as const)
/**
 * `0`: Failed,
 * `1`: Assisted Clear,
 * `2`: Clear,
 * `3`: LIFE4,
 * `4`: Good FC (Full Combo),
 * `5`: Great FC,
 * `6`: PFC,
 * `7`: MFC
 */
export type ClearLamp = Unwrap<typeof clearLamps>[0]
export const clearLampMap: ReadonlyMap<
  ClearLamp,
  Unwrap<typeof clearLamps>[1]
> = clearLamps

const danceLevels = [
  'E',
  'D',
  'D+',
  'C-',
  'C',
  'C+',
  'B-',
  'B',
  'B+',
  'A-',
  'A',
  'A+',
  'AA-',
  'AA',
  'AA+',
  'AAA',
] as const
/** `"E"`～`"AAA"` */
export type DanceLevel = Unwrap<typeof danceLevels>
export const danceLevelSet: ReadonlySet<DanceLevel> = new Set(danceLevels)

/**
 * Create {@link ScoreSchema} from song, chart, user and score.
 */
export function createScoreSchema(
  song: Pick<SongSchema | CourseSchema, 'id' | 'name' | 'deleted'>,
  chart: Readonly<StepChartSchema | CourseChartSchema>,
  user: Readonly<Pick<UserSchema, 'id' | 'name' | 'isPublic'>>,
  score: Readonly<ScoreBody>
): ScoreSchema {
  const scoreSchema: ScoreSchema = {
    userId: user.id,
    userName: user.name,
    isPublic: user.isPublic,
    songId: song.id,
    songName: song.name,
    playStyle: chart.playStyle,
    difficulty: chart.difficulty,
    level: chart.level,
    score: score.score,
    clearLamp: score.clearLamp,
    rank: score.rank,
  }
  if (score.exScore) scoreSchema.exScore = score.exScore
  if (score.maxCombo) scoreSchema.maxCombo = score.maxCombo
  if (song.deleted) scoreSchema.deleted = true

  if (!isAreaUser(user) && isSongChart(chart)) {
    scoreSchema.radar = calcMyGrooveRadar(chart, score)
  }

  return scoreSchema

  function isSongChart(chart: unknown): chart is StepChartSchema {
    return hasIntegerProperty(chart, 'stream')
  }
}
