<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <div class="buttons">
      <b-button
        v-for="(name, i) in nameIndexList"
        :key="i"
        :to="`/name/${i}`"
        type="is-info"
        tag="nuxt-link"
        :disabled="i === selected"
        :outlined="i === selected"
      >
        {{ name }}
      </b-button>
    </div>
    <song-list :songs="songs" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { searchSongByName } from '~/api/song'
import SongList from '~/components/pages/songs/SongList.vue'

@Component({ components: { SongList }, fetchOnServer: false })
export default class SongByNamePage extends Vue {
  /** Song List from API */
  songs: Api.SongListData[] = []

  /** Name index title (like "あ", "A", "数字・記号") */
  get title() {
    return (Song.nameIndexMap as Map<number, string>).get(this.selected)
  }

  get selected() {
    return parseInt(this.$route.params.nameIndex, 10)
  }

  /** "あ", ..., "A", ..., "数字・記号" */
  get nameIndexList() {
    return [...Song.nameIndexMap.values()]
  }

  /** nameIndex should be [0-36] */
  validate({ params }: Pick<Context, 'params'>) {
    const parsedIndex = parseInt(params.nameIndex, 10)
    return (
      /^\d{1,2}$/.test(params.nameIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < Song.nameIndexMap.size
    )
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return { title: this.title }
  }

  /** Get Song List from API */
  async fetch() {
    this.songs = await searchSongByName(this.$http, this.selected)
  }
}
</script>
