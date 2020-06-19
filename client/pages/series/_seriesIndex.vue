<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <b-table
      :data="songs"
      striped
      :loading="$fetchState.pending"
      :mobile-cards="false"
      paginated
      per-page="50"
    >
      <template slot-scope="props">
        <b-table-column field="name" label="Name">
          <nuxt-link :to="`/songs/${props.row.id}`">
            {{ props.row.name }}
          </nuxt-link>
        </b-table-column>
        <b-table-column field="artist" label="Artist">
          {{ props.row.artist }}
        </b-table-column>
        <b-table-column field="bpm" label="BPM">
          {{ displayedBPM(props.row.minBPM, props.row.maxBPM) }}
        </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>Nothing here.</p>
          </div>
        </section>
      </template>
    </b-table>
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { SeriesList, SongInfo } from '~/types/api/song'

type Song = Omit<SongInfo, 'charts'>

@Component
export default class SongBySeriesPage extends Vue {
  title: string = ''
  songs: Song[] = []

  validate({ params }: Pick<Context, 'params'>) {
    const parsedIndex = parseInt(params.seriesIndex, 10)
    return (
      /^\d{1,2}$/.test(params.seriesIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < SeriesList.length
    )
  }

  asyncData({ payload, params }: Pick<Context, 'params' | 'payload'>) {
    if (payload) return { ...payload } // { title: string }

    // Get series title
    const title = SeriesList[parseInt(params.seriesIndex, 10)]
    return { title }
  }

  // Get song list from API
  async fetch() {
    const i = this.$route.params.seriesIndex
    const songs: Song[] = await this.$http.$get<Song[]>(`/songs/series/${i}`)
    this.songs = songs
  }

  displayedBPM(minBPM: number | null, maxBPM: number | null) {
    if (!minBPM || !maxBPM) return '???'
    if (minBPM === maxBPM) return `${minBPM}`
    return `${minBPM}-${maxBPM}`
  }
}
</script>