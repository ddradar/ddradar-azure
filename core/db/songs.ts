import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
  Unwrap,
} from '../typeUtils'

/** DB Schema of Song */
export type SongSchema = {
  /**
   * ID that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  id: string
  name: string
  /**
   * Furigana for sorting.
   * @example `^([A-Z0-9 .ぁ-んー]*)$`
   */
  nameKana: string
  /**
   * Index for sorting. Associated with the "Choose by Name" folder.
   * @example `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
   */
  nameIndex: NameIndex
  artist: string
  /** Series title depend on official site. */
  series: Series
  /**
   * Displayed min BPM (Beet Per Minutes).
   * Set to `null` if not revealed, such as "???".
   */
  minBPM: number | null
  /**
   * Displayed max BPM (Beet Per Minutes).
   * Set to `null` if not revealed, such as "???".
   */
  maxBPM: number | null
  charts: ReadonlyArray<StepChartSchema>
  skillAttackId?: number
  /** Song is deleted or not */
  deleted?: boolean
}

export type GrooveRadar = {
  /** Groove Radar STREAM */
  stream: number
  /** Groove Radar VOLTAGE */
  voltage: number
  /** Groove Radar AIR */
  air: number
  /** Groove Radar FREEZE */
  freeze: number
  /** Groove Radar CHAOS */
  chaos: number
}

/** Song's step chart */
export type StepChartSchema = {
  playStyle: PlayStyle
  difficulty: Difficulty
  level: number
  /** Normal arrow count. (Jump = 1 count) */
  notes: number
  /** Freeze Arrow count. */
  freezeArrow: number
  /** Shock Arrow count. */
  shockArrow: number
} & GrooveRadar

/** DB Schema of Course */
export type CourseSchema = Omit<
  SongSchema,
  'nameIndex' | 'artist' | 'charts' | 'skillAttackId'
> & {
  /** `-1`: NONSTOP, `-2`: Grade */
  nameIndex: -1 | -2
  charts: ReadonlyArray<CourseChartSchema>
}

export type CourseChartSchema = Omit<StepChartSchema, keyof GrooveRadar> & {
  order: ReadonlyArray<ChartOrder>
}

export type ChartOrder = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level'
> & {
  /**
   * Song id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  songId: string
  songName: string
}

export function isValidId(id: string): boolean {
  return /^[01689bdiloqDIOPQ]{32}$/.test(id)
}

export function isSongSchema(obj: unknown): obj is SongSchema {
  return (
    hasStringProperty(obj, 'id', 'name', 'nameKana', 'artist', 'series') &&
    isValidId(obj.id) &&
    /^([A-Z0-9 .ぁ-んー]*)$/.test(obj.nameKana) &&
    (seriesSet as ReadonlySet<string>).has(obj.series) &&
    hasIntegerProperty(obj, 'nameIndex') &&
    obj.nameIndex >= 0 &&
    obj.nameIndex <= 36 &&
    (hasIntegerProperty(obj, 'minBPM', 'maxBPM') ||
      (hasProperty(obj, 'minBPM', 'maxBPM') &&
        obj.minBPM === null &&
        obj.maxBPM === null)) &&
    hasProperty(obj, 'charts') &&
    Array.isArray(obj.charts) &&
    obj.charts.every(c => isStepChartSchema(c))
  )
}

const isStepChartSchema = (obj: unknown): obj is StepChartSchema =>
  hasIntegerProperty(
    obj,
    'playStyle',
    'difficulty',
    'level',
    'notes',
    'freezeArrow',
    'shockArrow',
    'stream',
    'voltage',
    'air',
    'freeze',
    'chaos'
  ) &&
  (obj.playStyle === 1 || obj.playStyle === 2) &&
  obj.difficulty >= 0 &&
  obj.difficulty <= 4 &&
  obj.level >= 1 &&
  obj.level <= 20

const series = new Set([
  'DDR 1st',
  'DDR 2ndMIX',
  'DDR 3rdMIX',
  'DDR 4thMIX',
  'DDR 5thMIX',
  'DDRMAX',
  'DDRMAX2',
  'DDR EXTREME',
  'DDR SuperNOVA',
  'DDR SuperNOVA2',
  'DDR X',
  'DDR X2',
  'DDR X3 VS 2ndMIX',
  'DanceDanceRevolution (2013)',
  'DanceDanceRevolution (2014)',
  'DanceDanceRevolution A',
  'DanceDanceRevolution A20',
  'DanceDanceRevolution A20 PLUS',
] as const)
/** Series title depend on official site. */
export type Series = Unwrap<typeof series>
export const seriesSet: ReadonlySet<Series> = series

const nameIndexes = new Map([
  [0, 'あ'],
  [1, 'か'],
  [2, 'さ'],
  [3, 'た'],
  [4, 'な'],
  [5, 'は'],
  [6, 'ま'],
  [7, 'や'],
  [8, 'ら'],
  [9, 'わ'],
  [10, 'A'],
  [11, 'B'],
  [12, 'C'],
  [13, 'D'],
  [14, 'E'],
  [15, 'F'],
  [16, 'G'],
  [17, 'H'],
  [18, 'I'],
  [19, 'J'],
  [20, 'K'],
  [21, 'L'],
  [22, 'M'],
  [23, 'N'],
  [24, 'O'],
  [25, 'P'],
  [26, 'Q'],
  [27, 'R'],
  [28, 'S'],
  [29, 'T'],
  [30, 'U'],
  [31, 'V'],
  [32, 'W'],
  [33, 'X'],
  [34, 'Y'],
  [35, 'Z'],
  [36, '数字・記号'],
] as const)
/** `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号 */
export type NameIndex = Unwrap<typeof nameIndexes>[0]
export const nameIndexMap: ReadonlyMap<
  NameIndex,
  Unwrap<typeof nameIndexes>[1]
> = nameIndexes

const playStyles = new Map([
  [1, 'SINGLE'],
  [2, 'DOUBLE'],
] as const)
/** `1`: SINGLE, `2`: DOUBLE */
export type PlayStyle = Unwrap<typeof playStyles>[0]
export const playStyleMap: ReadonlyMap<
  PlayStyle,
  Unwrap<typeof playStyles>[1]
> = playStyles

const difficulties = new Map([
  [0, 'BEGINNER'],
  [1, 'BASIC'],
  [2, 'DIFFICULT'],
  [3, 'EXPERT'],
  [4, 'CHALLENGE'],
] as const)
/**
 * `0`: BEGINNER,
 * `1`: BASIC,
 * `2`: DIFFICULT,
 * `3`: EXPERT,
 * `4`: CHALLENGE
 */
export type Difficulty = Unwrap<typeof difficulties>[0]
export type DifficultyName = Unwrap<typeof difficulties>[1]
export const difficultyMap: ReadonlyMap<Difficulty, DifficultyName> =
  difficulties
