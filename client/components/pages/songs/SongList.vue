<template>
  <b-table
    :data="displayedSongs"
    striped
    :loading="loading"
    :mobile-cards="false"
    paginated
    per-page="50"
  >
    <b-table-column v-slot="props" field="series" :label="$t('list.series')">
      {{ props.row.series }}
    </b-table-column>
    <b-table-column v-slot="props" field="name" :label="$t('list.name')">
      <nuxt-link :to="`/songs/${props.row.id}`">
        {{ props.row.name }}
      </nuxt-link>
    </b-table-column>
    <b-table-column v-slot="props" field="artist" :label="$t('list.artist')">
      {{ props.row.artist }}
    </b-table-column>
    <b-table-column v-slot="props" field="bpm" :label="$t('list.bpm')">
      {{ props.row.bpm }}
    </b-table-column>

    <template #empty>
      <section v-if="loading" class="section">
        <b-skeleton animated />
        <b-skeleton animated />
        <b-skeleton animated />
      </section>
      <section v-else class="section">
        <div class="content has-text-grey has-text-centered">
          <p>{{ $t('list.noData') }}</p>
        </div>
      </section>
    </template>
  </b-table>
</template>

<i18n>
{
  "ja": {
    "list": {
      "series": "バージョン",
      "name": "曲名",
      "artist": "アーティスト",
      "bpm": "BPM",
      "noData": "データがありません"
    }
  },
  "en": {
    "list": {
      "series": "Version",
      "name": "Name",
      "artist": "Artist",
      "bpm": "BPM",
      "noData": "No Data"
    }
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getDisplayedBPM, shortenSeriesName } from '~/api/song'

@Component
export default class SongListComponent extends Vue {
  @Prop({ type: Array, required: false, default: () => [] })
  readonly songs!: Omit<Api.SongListData, 'nameKana' | 'nameIndex'>[]

  @Prop({ type: Boolean, required: false, default: false })
  readonly loading!: boolean

  get displayedSongs() {
    return this.songs.map(s => ({
      id: s.id,
      name: s.name,
      artist: s.artist,
      series: shortenSeriesName(s.series),
      bpm: getDisplayedBPM(s),
    }))
  }
}
</script>
