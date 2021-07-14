import { config } from 'dotenv'

// load .env file
config()

import type { Database } from '@ddradar/core'
import { fetchList, getContainer } from '@ddradar/db'
import consola from 'consola'

const courseInfo = {
  id: 'PQ0bDbI9dPQQ81iPO6lo0IDobb8q66Oq',
  name: 'FUTURE',
  nameKana: 'C-A20PLUS-14',
  nameIndex: -1,
  series: 'DanceDanceRevolution A20 PLUS',
} as const
const ids = [
  '6I0d1d8d690dl8boOb60O1Iq1Ddi6P8d', // 1st
  'I1DiOI16Id0qdlqbQ6ObPlilDP1oiI98', // 2nd
  'D686d06lO9IID8D0boPq0Pd8P89idO99', // 3rd
  '6ID160b99ibbd9OoblD0DPOl98lPbq6D', // FINAL
]

async function main() {
  consola.ready(`Add ${courseInfo.name} (${courseInfo.id})`)
  const resources = (await fetchList(
    'Songs',
    '*',
    [{ condition: 'ARRAY_CONTAINS(@, c.id)', value: ids }],
    { _ts: 'ASC' }
  )) as Database.SongSchema[]

  if (resources.length !== 4) {
    consola.warn('Not found 4 songs. Please check has been registered.')
  }

  const songs = resources.sort((l, r) => ids.indexOf(l.id) - ids.indexOf(r.id))
  consola.info(`1st: ${songs[0].name}`)
  consola.info(`2nd: ${songs[1].name}`)
  consola.info(`3rd: ${songs[2].name}`)
  consola.info(`Fin: ${songs[3].name}`)

  const chartKind = songs
    .reduce((prev, curr) => {
      for (const chart of curr.charts) {
        if (
          !prev.find(
            c =>
              c.playStyle === chart.playStyle &&
              c.difficulty === chart.difficulty
          )
        )
          prev.push({
            playStyle: chart.playStyle,
            difficulty: chart.difficulty,
          })
      }
      return prev
    }, [] as Pick<Database.StepChartSchema, 'playStyle' | 'difficulty'>[])
    .sort((l, r) =>
      l.playStyle === r.playStyle
        ? l.difficulty - r.difficulty
        : l.playStyle - r.playStyle
    )

  const course: Database.CourseSchema = {
    ...courseInfo,
    minBPM: Math.min(...songs.map(s => s.minBPM ?? 0)),
    maxBPM: Math.max(...songs.map(s => s.maxBPM ?? 0)),
    charts: chartKind.map(key => {
      const chartList = [getChart(0), getChart(1), getChart(2), getChart(3)]

      return {
        ...key,
        level: Math.max(...chartList.map(c => c.level)),
        notes: chartList.reduce((p, c) => p + c.notes, 0),
        freezeArrow: chartList.reduce((p, c) => p + c.freezeArrow, 0),
        shockArrow: chartList.reduce((p, c) => p + c.shockArrow, 0),
        order: chartList.map(c => ({
          songId: c.songId,
          songName: c.songName,
          playStyle: c.playStyle,
          difficulty: c.difficulty,
          level: c.level,
        })),
      }

      function getChart(i: number) {
        const chart =
          songs[i].charts.find(
            c =>
              c.playStyle === key.playStyle && c.difficulty === key.difficulty
          ) ??
          songs[i].charts.find(
            c => c.playStyle === key.playStyle && c.difficulty === 3
          ) ??
          songs[i].charts.find(
            c => c.playStyle === key.playStyle && c.difficulty === 4
          )
        if (!chart) throw new Error('Missing chart')
        return { ...chart, songId: songs[i].id, songName: songs[i].name }
      }
    }),
  }

  await getContainer('Songs').items.create(course)
  consola.success(`Added ${course.name} (${course.id})`)
}

// yarn start ./generate-course.ts
main().catch(e => consola.error(e))
