import type { ScoreSchema } from './scores'
import type { GrooveRadar, StepChartSchema } from './songs'

export type GrooveRadarSchema = Pick<StepChartSchema, 'playStyle'> & {
  userId: string
  type: 'radar'
} & GrooveRadar

export type ClearStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'clearLamp'
> & {
  type: 'clear'
  count: number
}

export type ScoreStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'rank'
> & {
  type: 'score'
  count: number
}
