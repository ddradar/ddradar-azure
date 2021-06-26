import type { ScoreBody } from '../api/score'
import type { StepChartSchema } from '../db/songs'
import {
  calcMyGrooveRadar,
  getDanceLevel,
  isScore,
  isValidScore,
  mergeScore,
  setValidScoreFromChart,
} from '../score'

describe('./score.ts', () => {
  describe('isScore', () => {
    const validScore: ScoreBody = {
      clearLamp: 2,
      rank: 'AA+',
      score: 978800,
    }
    test.each([undefined, null, true, 1.5, 'foo', {}])(
      '(%p) returns false',
      (obj: unknown) => expect(isScore(obj)).toBe(false)
    )
    test.each([
      validScore,
      { ...validScore, exScore: 334 },
      { ...validScore, maxCombo: 120 },
      { ...validScore, exScore: 334, maxCombo: 120 },
    ])('(%p) returns true', (obj: ScoreBody) => expect(isScore(obj)).toBe(true))
    test.each([
      { ...validScore, score: Infinity },
      { ...validScore, score: -1 },
      { ...validScore, score: 10000000 },
      { ...validScore, clearLamp: -2 },
      { ...validScore, clearLamp: 8 },
      { ...validScore, rank: '-' },
      { ...validScore, exScore: '334' },
      { ...validScore, maxCombo: true },
      { ...validScore, exScore: 334, maxCombo: {} },
      { ...validScore, exScore: NaN, maxCombo: 120 },
    ])('(%p) returns false', (obj: unknown) => expect(isScore(obj)).toBe(false))
  })
  describe('mergeScore', () => {
    test.each([
      [
        { score: 900000, clearLamp: 3, rank: 'AA' },
        { score: 850000, clearLamp: 4, exScore: 100, rank: 'A+' },
        { score: 900000, clearLamp: 4, rank: 'AA', exScore: 100 },
      ],
      [
        { score: 900000, clearLamp: 3, rank: 'AA' },
        { score: 920000, clearLamp: 0, rank: 'E' },
        { score: 920000, clearLamp: 3, rank: 'E' },
      ],
      [
        { score: 900000, clearLamp: 3, rank: 'AA' },
        { score: 850000, clearLamp: 4, maxCombo: 100, rank: 'A+' },
        { score: 900000, clearLamp: 4, rank: 'AA', maxCombo: 100 },
      ],
    ] as const)('(%p, %p) returns %p', (left, right, expected) => {
      // Assert - Act
      const merged1 = mergeScore(left, right)
      const merged2 = mergeScore(right, left)

      // Assert
      expect(merged1).toStrictEqual(expected)
      expect(merged2).toStrictEqual(expected)
    })
  })
  describe('isValidScore', () => {
    const chart = {
      notes: 100,
      freezeArrow: 20,
      shockArrow: 10,
    } as const
    const baseScore: ScoreBody = {
      score: 900000,
      clearLamp: 4,
      rank: 'AA',
    }
    test.each([
      { ...baseScore, exScore: 1000 },
      { ...baseScore, maxCombo: 1000 },
      { ...baseScore, exScore: 390 },
      { ...baseScore, exScore: 389 },
      { ...baseScore, exScore: 388 },
    ])('(chart, %p) returns false', score => {
      expect(isValidScore(chart, score)).toBe(false)
    })
    test.each([
      baseScore,
      { ...baseScore, exScore: 200 },
      { ...baseScore, clearLamp: 7, exScore: 390 },
      { ...baseScore, clearLamp: 6, exScore: 389 },
      { ...baseScore, clearLamp: 5, exScore: 388 },
      { ...baseScore, maxCombo: 110 },
      { ...baseScore, clearLamp: 3, maxCombo: 110 },
    ] as const)('(chart, %p) returns true', score => {
      expect(isValidScore(chart, score)).toBe(true)
    })
  })
  describe('calcMyGrooveRadar', () => {
    const chart: Omit<StepChartSchema, 'playStyle' | 'difficulty' | 'level'> = {
      notes: 150,
      freezeArrow: 50,
      shockArrow: 50,
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    }
    const score: ScoreBody = { clearLamp: 2, score: 800000, rank: 'A' }
    test('({ freeze: 0 }, score) returns { freeze: 0 }', () =>
      expect(
        calcMyGrooveRadar(
          { ...chart, freezeArrow: 0, freeze: 0 },
          { ...score, clearLamp: 4 }
        ).freeze
      ).toBe(0))
    test.each([
      [score, 80, 0, 0, 0, 0],
      [{ ...score, maxCombo: 100 } as const, 80, 50, 50, 0, 50],
      [{ ...score, clearLamp: 3 } as const, 80, 0, 98, 94, 98],
      [{ ...score, clearLamp: 4 } as const, 80, 100, 100, 100, 100],
    ])(
      '(chart, %p) returns { %i, %i, %i, %i, %i }',
      (score, stream, voltage, air, freeze, chaos) =>
        expect(calcMyGrooveRadar(chart, score)).toStrictEqual({
          stream,
          voltage,
          air,
          freeze,
          chaos,
        })
    )
  })
  describe('setValidScoreFromChart', () => {
    const chart = { notes: 1000, freezeArrow: 10, shockArrow: 10 } as const

    const mfcScore: ScoreBody = {
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      exScore: 3060,
      maxCombo: 1010,
    }
    /** Perfect:1 Score */
    const pfcScore: ScoreBody = {
      ...mfcScore,
      score: 999990,
      clearLamp: 6,
      exScore: 3059,
    }
    /** Great:1 Score */
    const gfcScore: ScoreBody = {
      ...pfcScore,
      score: 999590,
      clearLamp: 5,
      exScore: 3058,
    }
    /** Good:1 Score */
    const fcScore: ScoreBody = {
      ...gfcScore,
      score: 999200,
      clearLamp: 4,
      exScore: 3057,
    }
    /** 0 point falied Score */
    const noPlayScore: ScoreBody = {
      score: 0,
      rank: 'E',
      clearLamp: 0,
      exScore: 0,
      maxCombo: 0,
    }
    test.each([
      [{ clearLamp: 7 } as Partial<ScoreBody>, mfcScore], // MFC
      [{ score: 1000000 } as Partial<ScoreBody>, mfcScore], // MFC
      [{ exScore: 3060 } as Partial<ScoreBody>, mfcScore], // MFC
      [{ score: 999990 } as Partial<ScoreBody>, pfcScore], // P1
      [{ exScore: 3059 } as Partial<ScoreBody>, pfcScore], // P1
      [
        // Maybe PFC (score is greater than Great:1 score)
        { score: 999600 } as Partial<ScoreBody>,
        { ...pfcScore, score: 999600, exScore: 3020 },
      ],
      [
        // P20
        { exScore: 3040, clearLamp: 6 } as Partial<ScoreBody>,
        { ...pfcScore, score: 999800, exScore: 3040 },
      ],
      [{ exScore: 3058, clearLamp: 5 } as Partial<ScoreBody>, gfcScore], // Gr1
      [{ score: 999590, clearLamp: 5 } as Partial<ScoreBody>, gfcScore], // Gr1
      [
        // Gr1 P9
        { score: 999500, clearLamp: 5 } as Partial<ScoreBody>,
        { ...gfcScore, score: 999500, exScore: 3049 },
      ],
      [
        // Maybe Great:1 FC (score is greater than Good:1 score)
        { score: 999210 } as Partial<ScoreBody>,
        { ...gfcScore, score: 999210, exScore: 3020 },
      ],
      [
        // Cannot guess EX SCORE
        { score: 987600, clearLamp: 5 } as Partial<ScoreBody>,
        {
          score: 987600,
          rank: 'AA+',
          clearLamp: 5,
          maxCombo: 1010,
        } as ScoreBody,
      ],
      [{ exScore: 3057, clearLamp: 4 } as Partial<ScoreBody>, fcScore], // Gd1
      [{ score: 999200, clearLamp: 4 } as Partial<ScoreBody>, fcScore], // Gd1
      [
        // Gd1 P20
        { score: 999000, clearLamp: 4 } as Partial<ScoreBody>,
        { ...fcScore, score: 999000, exScore: 3037 },
      ],
      [
        // Maybe Full Combo (score is greater than Miss:1 score)
        { score: 999100 } as Partial<ScoreBody>,
        {
          score: 999100,
          rank: 'AAA',
          clearLamp: 4,
          maxCombo: 1010,
        } as ScoreBody,
      ],
      [
        // Cannot guess EX SCORE
        { score: 987600, clearLamp: 4 } as Partial<ScoreBody>,
        {
          score: 987600,
          clearLamp: 4,
          rank: 'AA+',
          maxCombo: 1010,
        } as ScoreBody,
      ],
      [
        // Miss1 P1
        { score: 999000, clearLamp: 2 } as Partial<ScoreBody>,
        {
          score: 999000,
          rank: 'AAA',
          clearLamp: 2,
          exScore: 3056,
        } as ScoreBody,
      ],
      [
        // Miss1 P1 (missed last FA)
        { score: 999000, clearLamp: 0, maxCombo: 1010 } as Partial<ScoreBody>,
        {
          score: 999000,
          rank: 'E',
          clearLamp: 0,
          exScore: 3056,
          maxCombo: 1010,
        } as ScoreBody,
      ],
      [
        { score: 948260, clearLamp: 3, maxCombo: 260 } as Partial<ScoreBody>,
        { score: 948260, rank: 'AA', clearLamp: 3, maxCombo: 260 } as ScoreBody,
      ],
      [
        { score: 948260, maxCombo: 260 } as Partial<ScoreBody>,
        { score: 948260, rank: 'AA', clearLamp: 2, maxCombo: 260 } as ScoreBody,
      ],
      [
        { score: 8460, rank: 'E' } as Partial<ScoreBody>,
        { score: 8460, rank: 'E', clearLamp: 0 } as ScoreBody,
      ],
      [{ score: 0, clearLamp: 0 } as Partial<ScoreBody>, noPlayScore], // 0 point
      [{ score: 0, rank: 'E' } as Partial<ScoreBody>, noPlayScore], // 0 point
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, clearLamp: 1 } as Partial<ScoreBody>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as ScoreBody,
      ],
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, clearLamp: 2 } as Partial<ScoreBody>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as ScoreBody,
      ],
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, rank: 'D' } as Partial<ScoreBody>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as ScoreBody,
      ],
    ])(
      '({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, %p) returns %p',
      (score: Partial<ScoreBody>, expected: ScoreBody) =>
        expect(setValidScoreFromChart(chart, score)).toStrictEqual(expected)
    )
    test('({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, { exScore: 800 }) throws error', () =>
      expect(() =>
        setValidScoreFromChart(chart, { exScore: 800 })
      ).toThrowError(/^Cannot guess Score object. set score property/))
    test.each([
      [
        { score: 993100, clearLamp: 5 } as Partial<ScoreBody>, // Gr3 P55
        {
          score: 993100,
          rank: 'AAA',
          clearLamp: 5,
          exScore: 509,
          maxCombo: 180,
        } as ScoreBody,
      ],
      [
        { score: 989100, clearLamp: 5 } as Partial<ScoreBody>, // Gr5 P32
        {
          score: 989100,
          rank: 'AA+',
          clearLamp: 5,
          exScore: 528,
          maxCombo: 180,
        } as ScoreBody,
      ],
    ])(
      '({ notes: 180, freezeArrow: 10, shockArrow: 0 }, %p) returns %p',
      (incompleteScore: Partial<ScoreBody>, expected: ScoreBody) => {
        // Arrange
        const chart = { notes: 180, freezeArrow: 10, shockArrow: 0 }

        // Act
        const actual = setValidScoreFromChart(chart, incompleteScore)

        // Assert
        expect(actual).toStrictEqual(expected)
      }
    )
  })
  describe('getDanceLevel', () => {
    test.each([
      [0, 'D'],
      [550000, 'D+'],
      [590000, 'C-'],
      [600000, 'C'],
      [650000, 'C+'],
      [690000, 'B-'],
      [700000, 'B'],
      [750000, 'B+'],
      [790000, 'A-'],
      [800000, 'A'],
      [850000, 'A+'],
      [890000, 'AA-'],
      [900000, 'AA'],
      [950000, 'AA+'],
      [990000, 'AAA'],
      [1000000, 'AAA'],
    ])('(%i) returns %s', (num, expected) =>
      expect(getDanceLevel(num)).toBe(expected)
    )
    test.each([-1, 10.5, NaN, Infinity, -Infinity, 1000010])(
      '(%d) throws error',
      d =>
        expect(() => getDanceLevel(d)).toThrowError(/^Invalid parameter: score/)
    )
  })
})
