import type { ItemDefinition } from '@azure/cosmos'
import type { Logger } from '@azure/functions'
import type { Database } from '@ddradar/core'
import { fetchTotalChartCount, getContainer } from '@ddradar/db'

type TotalCount = { id?: string } & Pick<
  Database.ClearStatusSchema,
  'level' | 'playStyle' | 'count'
>
type UpdateSongResult = {
  scores: Database.ScoreSchema[]
  details: TotalCount[]
}

/**
 * Update song info of other container.
 * @param context Function context
 * @param songs Change feed of "Songs" container
 */
export default async function (
  context: { log: Pick<Logger, 'info' | 'warn' | 'error'> },
  songs: (Database.SongSchema | Database.CourseSchema)[],
  oldTotalCounts: Required<Omit<TotalCount, 'count'>>[]
): Promise<UpdateSongResult> {
  const scores: (Database.ScoreSchema & ItemDefinition)[] = []

  for (const song of songs) {
    context.log.info(`Start: ${song.name}`)

    // Get scores
    const container = getContainer('Scores')
    const { resources } = await container.items
      .query<Database.ScoreSchema & ItemDefinition>({
        query: 'SELECT * FROM c WHERE c.songId = @id',
        parameters: [{ name: '@id', value: song.id }],
      })
      .fetchAll()

    const topScores: Database.ScoreSchema[] = []
    // Update exists scores
    for (const score of resources) {
      const scoreText = `{ id: ${score.id}, userId: ${score.userId}, playStyle: ${score.playStyle}, difficulty: ${score.difficulty} }`
      const chart = (
        song.charts as (Database.StepChartSchema | Database.CourseChartSchema)[]
      ).find(
        c =>
          c.playStyle === score.playStyle && c.difficulty === score.difficulty
      )
      if (!chart) {
        context.log.error(`Not found chart: ${scoreText}`)
        continue
      }

      if (score.userId === '0') {
        topScores.push(score)
      }

      if (
        score.clearLamp >= 4 &&
        score.maxCombo &&
        score.maxCombo !== chart.notes + chart.shockArrow
      ) {
        context.log.warn(
          `maxCombo(${score.maxCombo}) is different than expected(${
            chart.notes + chart.shockArrow
          }): ${scoreText}`
        )
        context.log.warn('Make sure the chart info is correct.')
      }
      if (
        song.name !== score.songName ||
        chart.level !== score.level ||
        song.deleted !== score.deleted
      ) {
        context.log.info(`Updated: ${scoreText}`)
        const oldScore = { ...score }
        delete oldScore.deleted
        scores.push({
          ...oldScore,
          songName: song.name,
          level: chart.level,
          ...(song.deleted ? { deleted: true } : {}),
        })
      }
    }

    // Create empty score
    const emptyScore: Omit<
      Database.ScoreSchema,
      keyof Database.StepChartSchema
    > = {
      score: 0,
      clearLamp: 0,
      rank: 'E',
      userId: '0',
      userName: '0',
      isPublic: false,
      songId: song.id,
      songName: song.name,
    }
    for (const chart of song.charts) {
      if (
        !topScores.find(
          s =>
            s.playStyle === chart.playStyle && s.difficulty === chart.difficulty
        )
      ) {
        scores.push({
          ...emptyScore,
          playStyle: chart.playStyle,
          difficulty: chart.difficulty,
          level: chart.level,
          ...(song.deleted ? { deleted: true } : {}),
        })
      }
    }
  }

  const newTotalCounts = await fetchTotalChartCount()
  const details = newTotalCounts.map(r => ({
    ...r,
    id: oldTotalCounts.find(
      d => d.playStyle === r.playStyle && d.level === r.level
    )?.id,
  }))
  return { scores, details }
}
