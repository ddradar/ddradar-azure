import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
  Unwrap,
} from '../typeUtils'

/**
 * DB Schema of Song (included on "Songs" container)
 * @example
 * {
 *   "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *   "name": "イーディーエム・ジャンパーズ",
 *   "nameKana": "いーでぃーえむ じゃんぱーず",
 *   "nameIndex": 0,
 *   "artist": "かめりあ feat. ななひら",
 *   "series": "DanceDanceRevolution A",
 *   "minBPM": 72,
 *   "maxBPM": 145,
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "level": 3,
 *       "notes": 70,
 *       "freezeArrow": 11,
 *       "shockArrow": 0,
 *       "stream": 12,
 *       "voltage": 11,
 *       "air": 1,
 *       "freeze": 20,
 *       "chaos": 0
 *     },
 *     {
 *       "playStyle": 1,
 *       "difficulty": 1,
 *       "level": 5,
 *       "notes": 142,
 *       "freezeArrow": 24,
 *       "shockArrow": 0,
 *       "stream": 25,
 *       "voltage": 22,
 *       "air": 18,
 *       "freeze": 61,
 *       "chaos": 0
 *     },
 *     {
 *       "playStyle": 1,
 *       "difficulty": 2,
 *       "level": 8,
 *       "notes": 248,
 *       "freezeArrow": 25,
 *       "shockArrow": 0,
 *       "stream": 43,
 *       "voltage": 44,
 *       "air": 23,
 *       "freeze": 50,
 *       "chaos": 9
 *     },
 *     {
 *       "playStyle": 1,
 *       "difficulty": 3,
 *       "level": 12,
 *       "notes": 336,
 *       "freezeArrow": 47,
 *       "shockArrow": 0,
 *       "stream": 59,
 *       "voltage": 50,
 *       "air": 23,
 *       "freeze": 67,
 *       "chaos": 44
 *     },
 *     {
 *       "playStyle": 2,
 *       "difficulty": 1,
 *       "level": 4,
 *       "notes": 132,
 *       "freezeArrow": 23,
 *       "shockArrow": 0,
 *       "stream": 23,
 *       "voltage": 22,
 *       "air": 12,
 *       "freeze": 58,
 *       "chaos": 0
 *     },
 *     {
 *       "playStyle": 2,
 *       "difficulty": 2,
 *       "level": 8,
 *       "notes": 231,
 *       "freezeArrow": 22,
 *       "shockArrow": 0,
 *       "stream": 42,
 *       "voltage": 39,
 *       "air": 21,
 *       "freeze": 46,
 *       "chaos": 6
 *     },
 *     {
 *       "playStyle": 2,
 *       "difficulty": 3,
 *       "level": 11,
 *       "notes": 326,
 *       "freezeArrow": 45,
 *       "shockArrow": 0,
 *       "stream": 57,
 *       "voltage": 50,
 *       "air": 20,
 *       "freeze": 64,
 *       "chaos": 40
 *     }
 *   ]
 * }
 */
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
   * @description This property is the partition key.
   * @example `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
   */
  nameIndex: NameIndex
  /** Artist name */
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
  /** Song's step charts */
  charts: ReadonlyArray<StepChartSchema>
  /** ID used by {@link http://skillattack.com/sa4/ Skill Attack}. */
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
  /** {@link PlayStyle} */
  playStyle: PlayStyle
  /** {@link Difficulty} */
  difficulty: Difficulty
  level: number
  /** Normal arrow count. (Jump = 1 count) */
  notes: number
  /** Freeze Arrow count. */
  freezeArrow: number
  /** Shock Arrow count. */
  shockArrow: number
} & GrooveRadar

/**
 * DB Schema of Course (included on "Songs" container)
 * @example
 * {
 *   "id": "qbbOOO1QibO1861bqQII9lqlPiIoqb98",
 *   "name": "FIRST",
 *   "nameKana": "FIRST",
 *   "nameIndex": -1,
 *   "series": "DanceDanceRevolution A20",
 *   "minBPM": 119,
 *   "maxBPM": 180,
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "level": 4,
 *       "notes": 401,
 *       "freezeArrow": 8,
 *       "shockArrow": 0,
 *       "order": [
 *         {
 *           "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
 *           "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
 *           "playStyle": 1,
 *           "difficulty": 0,
 *           "level": 2
 *         },
 *         {
 *           "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
 *           "songName": "MAKE IT BETTER",
 *           "playStyle": 1,
 *           "difficulty": 0,
 *           "level": 3
 *         },
 *         {
 *           "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
 *           "songName": "TRIP MACHINE",
 *           "playStyle": 1,
 *           "difficulty": 0,
 *           "level": 3
 *         },
 *         {
 *           "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *           "songName": "PARANOiA",
 *           "playStyle": 1,
 *           "difficulty": 0,
 *           "level": 4
 *         }
 *       ]
 *     },
 *     {
 *       "playStyle": 1,
 *       "difficulty": 1,
 *       "level": 8,
 *       "notes": 730,
 *       "freezeArrow": 4,
 *       "shockArrow": 0,
 *       "order": [
 *         {
 *           "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
 *           "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
 *           "playStyle": 1,
 *           "difficulty": 1,
 *           "level": 4
 *         },
 *         {
 *           "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
 *           "songName": "MAKE IT BETTER",
 *           "playStyle": 1,
 *           "difficulty": 1,
 *           "level": 7
 *         },
 *         {
 *           "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
 *           "songName": "TRIP MACHINE",
 *           "playStyle": 1,
 *           "difficulty": 1,
 *           "level": 8
 *         },
 *         {
 *           "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *           "songName": "PARANOiA",
 *           "playStyle": 1,
 *           "difficulty": 1,
 *           "level": 8
 *         }
 *       ]
 *     },
 *     {
 *       "playStyle": 1,
 *       "difficulty": 2,
 *       "level": 9,
 *       "notes": 918,
 *       "freezeArrow": 18,
 *       "shockArrow": 0,
 *       "order": [
 *         {
 *           "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
 *           "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
 *           "playStyle": 1,
 *           "difficulty": 2,
 *           "level": 6
 *         },
 *         {
 *           "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
 *           "songName": "MAKE IT BETTER",
 *           "playStyle": 1,
 *           "difficulty": 2,
 *           "level": 9
 *         },
 *         {
 *           "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
 *           "songName": "TRIP MACHINE",
 *           "playStyle": 1,
 *           "difficulty": 2,
 *           "level": 9
 *         },
 *         {
 *           "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *           "songName": "PARANOiA",
 *           "playStyle": 1,
 *           "difficulty": 2,
 *           "level": 9
 *         }
 *       ]
 *     },
 *     {
 *       "playStyle": 1,
 *       "difficulty": 3,
 *       "level": 12,
 *       "notes": 1091,
 *       "freezeArrow": 21,
 *       "shockArrow": 0,
 *       "order": [
 *         {
 *           "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
 *           "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
 *           "playStyle": 1,
 *           "difficulty": 3,
 *           "level": 10
 *         },
 *         {
 *           "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
 *           "songName": "MAKE IT BETTER",
 *           "playStyle": 1,
 *           "difficulty": 3,
 *           "level": 12
 *         },
 *         {
 *           "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
 *           "songName": "TRIP MACHINE",
 *           "playStyle": 1,
 *           "difficulty": 3,
 *           "level": 10
 *         },
 *         {
 *           "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *           "songName": "PARANOiA",
 *           "playStyle": 1,
 *           "difficulty": 3,
 *           "level": 11
 *         }
 *       ]
 *     },
 *     {
 *       "playStyle": 2,
 *       "difficulty": 1,
 *       "level": 9,
 *       "notes": 733,
 *       "freezeArrow": 3,
 *       "shockArrow": 0,
 *       "order": [
 *         {
 *           "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
 *           "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
 *           "playStyle": 2,
 *           "difficulty": 1,
 *           "level": 4
 *         },
 *         {
 *           "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
 *           "songName": "MAKE IT BETTER",
 *           "playStyle": 2,
 *           "difficulty": 1,
 *           "level": 7
 *         },
 *         {
 *           "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
 *           "songName": "TRIP MACHINE",
 *           "playStyle": 2,
 *           "difficulty": 1,
 *           "level": 9
 *         },
 *         {
 *           "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *           "songName": "PARANOiA",
 *           "playStyle": 2,
 *           "difficulty": 1,
 *           "level": 8
 *         }
 *       ]
 *     },
 *     {
 *       "playStyle": 2,
 *       "difficulty": 2,
 *       "level": 13,
 *       "notes": 951,
 *       "freezeArrow": 8,
 *       "shockArrow": 0,
 *       "order": [
 *         {
 *           "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
 *           "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
 *           "playStyle": 2,
 *           "difficulty": 2,
 *           "level": 6
 *         },
 *         {
 *           "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
 *           "songName": "MAKE IT BETTER",
 *           "playStyle": 2,
 *           "difficulty": 2,
 *           "level": 9
 *         },
 *         {
 *           "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
 *           "songName": "TRIP MACHINE",
 *           "playStyle": 2,
 *           "difficulty": 2,
 *           "level": 10
 *         },
 *         {
 *           "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *           "songName": "PARANOiA",
 *           "playStyle": 2,
 *           "difficulty": 2,
 *           "level": 13
 *         }
 *       ]
 *     },
 *     {
 *       "playStyle": 2,
 *       "difficulty": 3,
 *       "level": 11,
 *       "notes": 1176,
 *       "freezeArrow": 15,
 *       "shockArrow": 0,
 *       "order": [
 *         {
 *           "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
 *           "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
 *           "playStyle": 2,
 *           "difficulty": 3,
 *           "level": 10
 *         },
 *         {
 *           "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
 *           "songName": "MAKE IT BETTER",
 *           "playStyle": 2,
 *           "difficulty": 3,
 *           "level": 11
 *         },
 *         {
 *           "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
 *           "songName": "TRIP MACHINE",
 *           "playStyle": 2,
 *           "difficulty": 3,
 *           "level": 10
 *         },
 *         {
 *           "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
 *           "songName": "PARANOiA",
 *           "playStyle": 2,
 *           "difficulty": 3,
 *           "level": 11
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export type CourseSchema = Omit<
  SongSchema,
  'nameIndex' | 'artist' | 'charts' | 'skillAttackId'
> & {
  /** `-1`: NONSTOP, `-2`: Grade */
  nameIndex: -1 | -2
  /** Course difficulties */
  charts: ReadonlyArray<CourseChartSchema>
}

/** Course difficulty */
export type CourseChartSchema = Omit<StepChartSchema, keyof GrooveRadar> & {
  /** Course order (4 songs) */
  order: ReadonlyArray<ChartOrder>
}

export type ChartOrder = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level'
> & {
  /** {@link SongSchema.id} */
  songId: string
  /** {@link SongSchema.name} */
  songName: string
}

/** Returns `id` is valid {@link SongSchema.id} or not. */
export function isValidId(id: string): boolean {
  return /^[01689bdiloqDIOPQ]{32}$/.test(id)
}

/** Type assertion for {@link SongSchema} */
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
  function isStepChartSchema(obj: unknown): obj is StepChartSchema {
    return (
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
    )
  }
}

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
/**
 * Get {@link NameIndex} from Furigana.
 * @param {string} nameKana Furigana
 * @returns {string} {@link NameIndex}
 */
export function getNameIndex(nameKana: string): NameIndex {
  const regExps = new Map<RegExp, NameIndex>([
    [/^[ぁ-お]/, 0],
    [/^[か-ご]/, 1],
    [/^[さ-ぞ]/, 2],
    [/^[た-ど]/, 3],
    [/^[な-の]/, 4],
    [/^[は-ぽ]/, 5],
    [/^[ま-も]/, 6],
    [/^[ゃ-よ]/, 7],
    [/^[ら-ろ]/, 8],
    [/^[ゎ-ん]/, 9],
    [/^[aA]/, 10],
    [/^[bB]/, 11],
    [/^[cC]/, 12],
    [/^[dD]/, 13],
    [/^[eE]/, 14],
    [/^[fF]/, 15],
    [/^[gG]/, 16],
    [/^[hH]/, 17],
    [/^[iI]/, 18],
    [/^[jJ]/, 19],
    [/^[kK]/, 20],
    [/^[lL]/, 21],
    [/^[mM]/, 22],
    [/^[nN]/, 23],
    [/^[oO]/, 24],
    [/^[pP]/, 25],
    [/^[qQ]/, 26],
    [/^[rR]/, 27],
    [/^[sS]/, 28],
    [/^[tT]/, 29],
    [/^[uU]/, 30],
    [/^[vV]/, 31],
    [/^[wW]/, 32],
    [/^[xX]/, 33],
    [/^[yY]/, 34],
    [/^[zZ]/, 35],
  ])
  for (const map of regExps) {
    if (map[0].test(nameKana)) return map[1]
  }
  return 36
}

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
