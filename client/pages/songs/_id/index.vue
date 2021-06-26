<template>
  <section v-if="song" class="section">
    <h1 class="title">{{ song.name }}</h1>
    <h2 class="subtitle">{{ song.artist }} / {{ song.series }}</h2>
    <h2 class="subtitle">BPM {{ displayedBPM }}</h2>
    <div v-if="$accessor.isAdmin" class="buttons">
      <b-button
        type="is-info"
        icon-left="pencil-box"
        tag="nuxt-link"
        :to="`/admin/song/${song.id}`"
      >
        編集
      </b-button>
    </div>
    <div class="content columns is-multiline">
      <chart-detail
        v-for="(chart, i) in singleCharts"
        :key="i"
        :song="song"
        :chart="chart"
        class="
          column
          is-half-tablet is-one-third-desktop is-one-quarter-widescreen
        "
        :open="playStyle === chart.playStyle && difficulty === chart.difficulty"
      />
    </div>
    <div class="content columns is-multiline">
      <chart-detail
        v-for="(chart, i) in doubleCharts"
        :key="i"
        :song="song"
        :chart="chart"
        class="
          column
          is-half-tablet is-one-third-desktop is-one-quarter-widescreen
        "
        :open="playStyle === chart.playStyle && difficulty === chart.difficulty"
      />
    </div>
  </section>
</template>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { getDisplayedBPM, getSongInfo } from '~/api/song'
import ChartDetail from '~/components/pages/songs/ChartDetail.vue'

@Component({ components: { ChartDetail } })
export default class SongDetailPage extends Vue {
  song: Api.SongInfo | null = null
  playStyle: Song.PlayStyle | 0 = 0
  difficulty: Song.Difficulty | -1 = -1

  get singleCharts() {
    return this.song?.charts.filter(c => c.playStyle === 1) ?? []
  }

  get doubleCharts() {
    return this.song?.charts.filter(c => c.playStyle === 2) ?? []
  }

  get displayedBPM() {
    return this.song
      ? getDisplayedBPM(this.song)
      : /* istanbul ignore next */ '???'
  }

  /** `id` should be songId pattern */
  validate({ params }: Pick<Context, 'params'>) {
    return Song.isValidId(params.id)
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return { title: this.song?.name ?? 'Song Detail' }
  }

  async asyncData({
    params,
    $http,
    route,
    payload,
  }: Pick<Context, 'params' | '$http' | 'route' | 'payload'>) {
    // Get song info from API
    const song =
      (payload as Api.SongInfo) || (await getSongInfo($http, params.id))

    // Set chartIndex
    const chart = route?.hash
    if (/^#(1[0-4]|2[1-4])$/.test(chart)) {
      const selectedChart = parseInt(chart.substring(1))
      const difficulty = selectedChart % 10
      const playStyle = (selectedChart - difficulty) / 10
      return { song, playStyle, difficulty }
    }

    return { song }
  }
}
</script>
