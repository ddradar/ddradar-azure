import type { Unwrap } from '../typeUtils'
import type { StepChartSchema } from './songs'

export type ScoreSchema = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level'
> & {
  /** User ID */
  userId: string
  userName: string
  /** `true` if this score is public, otherwize `false`. */
  isPublic: boolean
  /**
   * Song id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  songId: string
  songName: string
  /** Normal score (0-1000000) */
  score: number
  exScore?: number
  maxCombo?: number
  clearLamp: ClearLamp
  /** Clear rank (`"E"`～`"AAA"`) */
  rank: DanceLevel
  /** Groove Radar */
  radar?: Pick<
    StepChartSchema,
    'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
  >
  /**
   * Song is deleted or not.
   * If true, this score is not counted.
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
export type DanceLevel = Unwrap<typeof danceLevels>
export const danceLevelSet: ReadonlySet<DanceLevel> = new Set(danceLevels)
