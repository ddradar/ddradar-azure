<template>
  <b-table
    :data="displayedCharts"
    striped
    :loading="loading"
    :mobile-cards="false"
    paginated
    per-page="50"
  >
    <b-table-column v-slot="props" field="series" :label="$t('series')">
      {{ props.row.series }}
    </b-table-column>
    <b-table-column v-slot="props" field="name" :label="$t('name')">
      <nuxt-link :to="props.row.link">{{ props.row.name }}</nuxt-link>
    </b-table-column>
    <b-table-column v-slot="props" field="difficulty" :label="$t('difficulty')">
      <b-tag :type="props.row.class">{{ props.row.difficultyName }}</b-tag>
    </b-table-column>
    <b-table-column v-slot="props" field="level" :label="$t('level')" numeric>
      {{ props.row.level }}
    </b-table-column>
    <b-table-column v-slot="props" field="level" :label="$t('edit')">
      <a
        @click="
          scoreEditorModal(
            props.row.id,
            props.row.playStyle,
            props.row.difficulty
          )
        "
      >
        <b-icon icon="pencil-box-outline" />
      </a>
    </b-table-column>

    <template slot="empty">
      <section v-if="loading" class="section">
        <b-skeleton animated />
        <b-skeleton animated />
        <b-skeleton animated />
      </section>
      <section v-else class="section">
        <div class="content has-text-grey has-text-centered">
          <p>{{ $t('noData') }}</p>
        </div>
      </section>
    </template>
  </b-table>
</template>

<i18n>
{
  "ja": {
    "series": "バージョン",
    "name": "曲名",
    "difficulty": "難易度",
    "level": "レベル",
    "edit": "スコア編集",
    "noData": "データがありません"
  },
  "en": {
    "series": "Series",
    "name": "Name",
    "difficulty": "Difficulty",
    "level": "Lv",
    "edit": "Edit Score",
    "noData": "No data"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { getSongInfo, shortenSeriesName } from '~/api/song'
import ScoreEditor from '~/components/modal/ScoreEditor.vue'

@Component
export default class ChartListComponent extends Vue {
  @Prop({ required: false, type: Array, default: () => [] })
  readonly charts!: Api.ChartInfo[]

  @Prop({ required: false, type: Boolean, default: false })
  readonly loading!: boolean

  get displayedCharts() {
    const getLowerDiffName = (d: Song.Difficulty) =>
      Song.difficultyMap.get(d)!.toLowerCase() as Lowercase<Song.DifficultyName>
    return this.charts.map(c => ({
      series: shortenSeriesName(c.series),
      name: c.name,
      link: `/songs/${c.id}#${c.playStyle}${c.difficulty}` as const,
      difficultyName: Song.difficultyMap.get(c.difficulty)!,
      class: `is-${getLowerDiffName(c.difficulty)}` as const,
      level: c.level,
      id: c.id,
      playStyle: c.playStyle,
      difficulty: c.difficulty,
    }))
  }

  async scoreEditorModal(
    songId: string,
    playStyle: number,
    difficulty: number
  ) {
    const songData = await getSongInfo(this.$http, songId)
    this.$buefy.modal.open({
      parent: this,
      component: ScoreEditor,
      props: { songId, playStyle, difficulty, songData },
      hasModalCard: true,
      trapFocus: true,
    })
  }
}
</script>
