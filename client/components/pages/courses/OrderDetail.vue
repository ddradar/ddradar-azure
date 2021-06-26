<template>
  <section>
    <score-board :chart="chart" :info="course" />
    <card title="Chart Info" :type="cardType" collapsible>
      <div class="card-content">
        <div class="content">
          <ul>
            <li><em>Notes</em>: {{ chart.notes }}</li>
            <li><em>Freeze Arrow</em>: {{ chart.freezeArrow }}</li>
            <li><em>Shock Arrow</em>: {{ chart.shockArrow }}</li>
          </ul>
          <ol>
            <li v-for="o in orders" :key="o.id">
              <nuxt-link :to="o.to">{{ o.name }}</nuxt-link>
              {{ o.chartName }}
            </li>
          </ol>
        </div>
      </div>
    </card>
  </section>
</template>

<script lang="ts">
import type { Api, Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getChartTitle } from '~/api/song'
import Card from '~/components/shared/Card.vue'
import ScoreBoard from '~/components/shared/ScoreBoard.vue'

@Component({ components: { Card, ScoreBoard } })
export default class OrderDetailComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly course!: Api.CourseInfo

  @Prop({ required: true, type: Object })
  readonly chart!: Database.CourseChartSchema

  get cardType() {
    return `is-${
      Song.difficultyMap
        .get(this.chart.difficulty)!
        .toLowerCase() as Lowercase<Song.DifficultyName>
    }` as const
  }

  get orders() {
    return this.chart.order.map(s => ({
      id: s.songId,
      name: s.songName,
      chartName: getChartTitle(s),
      to: `/songs/${s.songId}/${s.playStyle}${s.difficulty}` as const,
    }))
  }
}
</script>
