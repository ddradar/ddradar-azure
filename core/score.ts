import type { ScoreBody } from './api/score'
import type { ClearLamp, GrooveRadar, StepChartSchema } from './db'
import { DanceLevel, danceLevelSet } from './db'
import { hasIntegerProperty, hasStringProperty } from './typeUtils'

/** Type assertion of {@link ScoreBody} */
export function isScore(obj: unknown): obj is ScoreBody {
  return (
    hasIntegerProperty(obj, 'score', 'clearLamp') &&
    obj.score >= 0 &&
    obj.score <= 1000000 &&
    obj.clearLamp >= 0 &&
    obj.clearLamp <= 7 &&
    (hasIntegerProperty(obj, 'exScore') ||
      (obj as Record<string, unknown>).exScore === undefined) &&
    (hasIntegerProperty(obj, 'maxCombo') ||
      (obj as Record<string, unknown>).maxCombo === undefined) &&
    hasStringProperty(obj, 'rank') &&
    (danceLevelSet as ReadonlySet<string>).has(obj.rank)
  )
}

/** Returns merged score */
export function mergeScore(
  left: Readonly<ScoreBody>,
  right: Readonly<ScoreBody>
): ScoreBody {
  const result: ScoreBody = {
    score: Math.max(left.score, right.score),
    clearLamp: Math.max(left.clearLamp, right.clearLamp) as ClearLamp,
    rank: left.score > right.score ? left.rank : right.rank,
  }
  if (left.exScore !== undefined || right.exScore !== undefined)
    result.exScore = Math.max(left.exScore ?? 0, right.exScore ?? 0)
  if (left.maxCombo !== undefined || right.maxCombo !== undefined)
    result.maxCombo = Math.max(left.maxCombo ?? 0, right.maxCombo ?? 0)
  return result
}

/** Validate score from chart. */
export function isValidScore(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>>,
  { clearLamp, exScore, maxCombo }: Readonly<Omit<ScoreBody, 'score' | 'rank'>>
): boolean {
  const maxExScore = (notes + freezeArrow + shockArrow) * 3
  const fullCombo = notes + shockArrow

  if (exScore) {
    if (
      !isPositiveInteger(exScore) ||
      exScore > maxExScore ||
      (clearLamp !== 7 && exScore === maxExScore) || // EX SCORE is MAX, but not MFC
      (clearLamp !== 6 && exScore === maxExScore - 1) || // EX SCORE is P1, but not PFC
      (clearLamp < 5 && exScore === maxExScore - 2) // EX SCORE is Gr1 or P2, but not Great FC or PFC
    )
      return false
  }

  // Do not check maxCombo because "MAX COMBO is fullCombo, but not FC" pattern is exists.
  // ex. missed last Freeze Arrow
  return !maxCombo || (isPositiveInteger(maxCombo) && maxCombo <= fullCombo)
}

/** Calcurate My Groove Radar from score. */
export function calcMyGrooveRadar(
  chart: Omit<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>,
  score: ScoreBody
): GrooveRadar {
  const note = chart.notes + chart.shockArrow
  const isFullCombo = score.clearLamp >= 4
  const maxCombo = isFullCombo ? note : score.maxCombo ?? 0

  // Treat as miss:3 if Life 4 Clear
  const arrowCount =
    score.clearLamp === 3 ? Math.max(maxCombo, note - 3) : maxCombo
  const freezeCount = isFullCombo
    ? chart.freezeArrow
    : score.clearLamp === 3
    ? chart.freezeArrow - 3
    : 0

  return {
    stream: Math.trunc((chart.stream * score.score) / 1000000),
    voltage: Math.trunc((chart.voltage * maxCombo) / note),
    air: Math.trunc((chart.air * arrowCount) / note),
    freeze:
      chart.freezeArrow === 0
        ? 0
        : Math.trunc((chart.freeze * freezeCount) / chart.freezeArrow),
    chaos: Math.trunc((chart.chaos * arrowCount) / note),
  }
}

/** Complement score from chart info. */
export function setValidScoreFromChart(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>>,
  partialScore: Readonly<Partial<ScoreBody>>
): ScoreBody {
  const objects = notes + freezeArrow + shockArrow
  /** Max EX SCORE */
  const maxExScore = objects * 3
  /** Full Combo */
  const maxCombo = notes + shockArrow
  /** Marvelous or O.K. score */
  const baseScore = 1000000 / objects
  /** Great score */
  const great = baseScore * 0.6 - 10
  /** Good score */
  const good = baseScore * 0.2 - 10

  const isFailed = partialScore.rank === 'E' || partialScore.clearLamp === 0

  if (isMFC()) {
    return {
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      exScore: maxExScore,
      maxCombo,
    }
  }

  // Patterns that can be calculated from EX SCORE
  const scoreFromEx = tryCalcFromExScore()
  if (scoreFromEx !== null) {
    return scoreFromEx
  }

  if (partialScore.score === undefined)
    throw new Error('Cannot guess Score object. set score property')

  const result: ScoreBody = {
    ...partialScore,
    score: partialScore.score,
    rank: getDanceLevel(partialScore.score),
    clearLamp: partialScore.clearLamp ?? 2, // set "Clear" default
  }

  if (isPFC()) {
    const dropCount = (1000000 - partialScore.score) / 10
    return {
      ...result,
      clearLamp: 6,
      exScore: maxExScore - dropCount,
      maxCombo,
    }
  }

  if (isGreatFC()) {
    const calcFromGreatFC = tryCalcFromGreatFC()
    return (
      calcFromGreatFC ?? {
        ...result,
        clearLamp: 5,
        maxCombo,
      }
    )
  }

  if (isGood1()) {
    /** Perfect:0, Great:0, Good:1 Score */
    const target = floorScore(1000000 - baseScore + good)
    const perfectCount = (target - partialScore.score) / 10
    return {
      ...result,
      clearLamp: 4,
      exScore: maxExScore - 3 - perfectCount,
      maxCombo,
    }
  }

  if (isGoodFC()) {
    return {
      ...result,
      clearLamp: 4,
      maxCombo,
    }
  }

  if (isFailed) {
    result.clearLamp = 0
    result.rank = 'E'
  }

  // Currently, 0 point can only be obtained by the following methods:
  // 1. Failed
  // 2. CHAOS [SP-BEGINNER] with CUT1 (= Assisted Clear)
  // 3. ようこそジャパリパークへ [DP-CHALLENGE] with JUMP OFF (= Assisted Clear)
  if (partialScore.score === 0) {
    return {
      ...result,
      score: 0,
      clearLamp: isFailed ? 0 : 1,
      exScore: 0,
      maxCombo: 0,
    }
  }

  if (isMiss1()) {
    /** Perfect:0, Great:0, Good:0, Miss:1 score */
    const target = floorScore(1000000 - baseScore)
    const perfectCount = (target - partialScore.score) / 10
    result.exScore = maxExScore - 3 - perfectCount
  }

  return result

  function isMFC() {
    return (
      partialScore.clearLamp === 7 ||
      partialScore.score === 1000000 ||
      partialScore.exScore === maxExScore
    )
  }

  /* eslint-disable @typescript-eslint/no-non-null-assertion -- already checked before these methods called */
  function isPFC() {
    return (
      partialScore.clearLamp === 6 || // ClearLamp is PFC
      partialScore.score! > floorScore(1000000 - baseScore + great) // Score is greater than Gr:1 score
    )
  }

  function isGreatFC() {
    return (
      partialScore.clearLamp === 5 || // ClearLamp is GreatFC
      partialScore.score! > floorScore(1000000 - baseScore + good) // Score is greater than Good:1 score
    )
  }

  function isGoodFC() {
    return (
      partialScore.clearLamp === 4 || // ClearLamp is GoodFC
      partialScore.score! > floorScore(1000000 - baseScore) // Score is greater than Miss:1 score
    )
  }

  function isGood1() {
    return (
      partialScore.clearLamp === 4 &&
      partialScore.score! > floorScore(1000000 - baseScore * 2 - good + great) // Score is greater than Great:1, Good:1 score
    )
  }

  function isMiss1() {
    return (
      (partialScore.clearLamp ?? 2) < 4 && // Not selected Full combo
      (partialScore.score! > floorScore(1000000 - baseScore * 2 + great) || // Score is greater than Great:1, Miss:1
        partialScore.maxCombo === maxCombo) // [Note]: This is NOT Full Combo. (ex. missed last Freeze Arrow)
    )
  }

  function tryCalcFromGreatFC(): Required<ScoreBody> | null {
    const dropScore = great - baseScore

    // Try to calc great count from score
    let greatCount = 0
    while (
      floorScore(1000000 + dropScore * (greatCount + 1)) >= partialScore.score!
    ) {
      greatCount++
    }

    // Can calc
    if (greatCount === 1 || (notes - greatCount) * 10 < -dropScore) {
      /** Perfect:0, Great: greatCount Score */
      const target = floorScore(1000000 + dropScore * greatCount)
      const perfectCount = (target - partialScore.score!) / 10
      return {
        score: partialScore.score!,
        rank: getDanceLevel(partialScore.score!),
        clearLamp: 5,
        exScore: maxExScore - perfectCount - greatCount * 2,
        maxCombo,
      }
    }

    return null
  }
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  function tryCalcFromExScore(): Required<ScoreBody> | null {
    // 1 Perfect
    if (partialScore.exScore === maxExScore - 1) {
      return {
        score: 999990,
        rank: 'AAA',
        clearLamp: 6,
        exScore: maxExScore - 1,
        maxCombo,
      }
    }

    // X Perfects
    if (partialScore.clearLamp === 6 && partialScore.exScore) {
      const dropCount = maxExScore - partialScore.exScore
      return {
        score: 1000000 - dropCount * 10,
        rank: 'AAA',
        clearLamp: 6,
        exScore: maxExScore - dropCount,
        maxCombo,
      }
    }

    // 1 Great 0 Perfect
    if (
      partialScore.clearLamp === 5 &&
      partialScore.exScore === maxExScore - 2
    ) {
      const score = floorScore(1000000 - baseScore + great)
      return {
        score,
        rank: getDanceLevel(score),
        clearLamp: 5,
        exScore: maxExScore - 2,
        maxCombo,
      }
    }

    // 1 Good 0 Great 0 Perfect
    if (
      partialScore.clearLamp === 4 &&
      partialScore.exScore === maxExScore - 3
    ) {
      const score = floorScore(1000000 - baseScore + good)
      return {
        score,
        rank: getDanceLevel(score),
        clearLamp: 4,
        exScore: maxExScore - 3,
        maxCombo,
      }
    }

    return null
  }

  /** Round down ones digit (ex. 998756 => 998750) */
  function floorScore(rawScore: number) {
    return Math.floor(rawScore / 10) * 10
  }
}

/** Get {@link DanceLevel} from {@link ScoreBody.score} */
export function getDanceLevel(score: number): Exclude<DanceLevel, 'E'> {
  if (!isPositiveInteger(score))
    throw new RangeError(
      `Invalid parameter: score(${score}) should be positive integer or 0.`
    )
  if (score > 1000000)
    throw new RangeError(
      `Invalid parameter: score(${score}) should be less than or equal to 1000000.`
    )
  const rankList = [
    { border: 990000, rank: 'AAA' },
    { border: 950000, rank: 'AA+' },
    { border: 900000, rank: 'AA' },
    { border: 890000, rank: 'AA-' },
    { border: 850000, rank: 'A+' },
    { border: 800000, rank: 'A' },
    { border: 790000, rank: 'A-' },
    { border: 750000, rank: 'B+' },
    { border: 700000, rank: 'B' },
    { border: 690000, rank: 'B-' },
    { border: 650000, rank: 'C+' },
    { border: 600000, rank: 'C' },
    { border: 590000, rank: 'C-' },
    { border: 550000, rank: 'D+' },
  ] as const
  for (const { border, rank } of rankList) {
    if (score >= border) return rank
  }
  return 'D'
}

const isPositiveInteger = (num: number) => Number.isInteger(num) && num >= 0

export type { ClearLamp, DanceLevel } from './db'
export { clearLampMap, danceLevelSet } from './db'
