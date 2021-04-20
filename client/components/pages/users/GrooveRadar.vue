<template>
  <reactive-radar :chart-data="chartData" :chart-options="chartOptions" />
</template>

<script lang="ts">
import type { Song } from '@ddradar/core'
import type { ChartData, ChartTooltipItem } from 'chart.js'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import ReactiveRadar from '~/components/shared/ReactiveRadar'

@Component({ components: { ReactiveRadar } })
export default class GrooveRadarComponent extends Vue {
  @Prop({ type: Object, default: null })
  readonly chart!: Song.GrooveRadar | null

  get chartOptions() {
    return {
      legend: { display: false },
      responsive: true,
      scale: { ticks: { beginAtZero: true, max: 200, min: 0, stepSize: 20 } },
      tooltips: { enabled: true, callbacks: { label: this.renderLabel } },
    }
  }

  get chartData(): ChartData {
    return {
      labels: ['STREAM', 'CHAOS', 'FREEZE', 'AIR', 'VOLTAGE'],
      datasets: [
        {
          label: 'data',
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
          borderColor: 'rgba(0, 192, 192, 0.5)',
          data: this.chart
            ? [
                this.chart.stream,
                this.chart.chaos,
                this.chart.freeze,
                this.chart.air,
                this.chart.voltage,
              ]
            : [],
        },
      ],
    }
  }

  renderLabel(
    { index }: Pick<ChartTooltipItem, 'index'>,
    { labels }: Pick<ChartData, 'labels'>
  ) {
    if (index === undefined || labels === undefined) return ''
    const dataSet = labels[index]
    return Array.isArray(dataSet) ? dataSet[0] : dataSet
  }
}
</script>
