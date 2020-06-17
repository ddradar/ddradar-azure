import type { SongSchema, StepChartSchema } from './db/songs'

type Song = Omit<SongSchema, 'charts'>
type StepChart = StepChartSchema & Pick<SongSchema, 'id' | 'name' | 'series'>

export type { Song, StepChart }