<template>
  <reactive-doughnut :chart-data="chartData" :chart-options="chartOptions" />
</template>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Score } from '@ddradar/core'
import type { ChartData, ChartOptions } from 'chart.js'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import ReactiveDoughnut from '~/components/shared/ReactiveDoughnut'

@Component({ components: { ReactiveDoughnut } })
export default class ScoreStatusComponent extends Vue {
  @Prop({ type: String, default: null })
  readonly title!: string | null

  @Prop({ type: Array, default: () => [] })
  readonly statuses!: Pick<Api.ScoreStatus, 'rank' | 'count'>[]

  get sortedStatuses() {
    const levels: string[] = [...Score.danceLevelSet]
    return this.statuses
      .filter(d => d.count)
      .sort(
        (l, r) =>
          levels.findIndex(d => d === r.rank) -
          levels.findIndex(d => d === l.rank)
      ) // ORDER BY rank DESC
  }

  get chartOptions(): ChartOptions {
    return {
      responsive: true,
      legend: { display: false },
      elements: {
        // @ts-ignore
        center: { text: this.title ?? '' },
      },
    }
  }

  get chartData(): ChartData {
    return {
      labels: this.sortedStatuses.map(d =>
        Score.danceLevelSet.has(d.rank as Score.DanceLevel) ? d.rank : 'NoPlay'
      ),
      datasets: [
        {
          data: this.sortedStatuses.map(d => d.count),
          backgroundColor: this.sortedStatuses.map(d =>
            this.getBackgroundColor(d.rank)
          ),
        },
      ],
    }
  }

  getBackgroundColor(rank: Score.DanceLevel | '-') {
    const map = new Map<Score.DanceLevel | '-', string>([
      ['-', 'hsl(0, 0%, 71%)'], // grey-light
      ['E', 'hsl(0, 0%, 29%)'], // grey-dark
      ['D', 'hsl(348, 86%, 71%)'],
      ['D+', 'hsl(348, 86%, 61%)'], // red
      ['C-', 'hsl(271, 100%, 91%)'],
      ['C', 'hsl(271, 100%, 81%)'],
      ['C+', 'hsl(271, 100%, 71%)'], // purple
      ['B-', 'hsl(204, 71%, 78%)'],
      ['B', 'hsl(204, 71%, 67%)'],
      ['B+', 'hsl(204, 71%, 53%)'], // cyan
      ['A-', 'hsl(141, 53%, 78%)'],
      ['A', 'hsl(141, 53%, 67%)'],
      ['A+', 'hsl(141, 53%, 53%)'], // green
      ['AA-', 'hsl(48, 100%, 89%)'],
      ['AA', 'hsl(48, 100%, 78%)'],
      ['AA+', 'hsl(48, 100%, 67%)'], // yellow
      ['AAA', 'hsl(177, 97%, 74%)'], // light-blue
    ])
    return map.get(rank)!
  }
}
</script>
