<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <div class="buttons">
      <b-button
        v-for="level in levelList"
        :key="level"
        :to="`/${$route.params.style}/${level}`"
        type="is-info"
        tag="nuxt-link"
        :disabled="level === selected"
        :outlined="level === selected"
      >
        {{ level }}
      </b-button>
    </div>
    <chart-list :charts="charts" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import type { Api } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { searchCharts } from '~/api/song'
import ChartList from '~/components/pages/charts/ChartList.vue'

@Component({ fetchOnServer: false, components: { ChartList } })
export default class ChartLevelPage extends Vue {
  /** Chart list */
  charts: Api.ChartInfo[] = []

  get selected() {
    return parseInt(this.$route.params.level, 10)
  }

  get playStyle() {
    return this.$route.params.style === 'double' ? 2 : 1
  }

  /** Page title */
  get title() {
    const style = this.$route.params.style.toUpperCase() as 'SINGLE' | 'DOUBLE'
    return `${style} ${this.selected}` as const
  }

  /** 1-19 */
  get levelList() {
    return [...Array(19).keys()].map(i => i + 1)
  }

  /** `style` expected 'single' or 'double' & `level` expected [1-20] */
  validate({ params }: Pick<Context, 'params'>) {
    const level = parseInt(params.level, 10)
    return (
      ['single', 'double'].includes(params.style) &&
      /^\d{1,2}$/.test(params.level) &&
      level >= 1 &&
      level <= 20
    )
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return { title: this.title }
  }

  /** Get `charts` from API */
  async fetch() {
    this.charts = await searchCharts(this.$http, this.playStyle, this.selected)
  }
}
</script>
