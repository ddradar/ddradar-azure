<template>
  <b-table
    :data="displayedScores"
    striped
    :loading="loading"
    paginated
    sortable
    per-page="50"
  >
    <b-table-column v-slot="props" field="songName" :label="$t('name')">
      <nuxt-link :to="props.row.link">{{ props.row.songName }}</nuxt-link>
    </b-table-column>
    <b-table-column
      v-slot="props"
      field="difficultyName"
      :label="$t('difficulty')"
    >
      <b-taglist attached>
        <b-tag :type="props.row.class">{{ props.row.difficultyName }}</b-tag>
        <b-tag :type="props.row.class">{{ props.row.level }}</b-tag>
      </b-taglist>
    </b-table-column>
    <b-table-column v-slot="props" field="score" :label="$t('score')" numeric>
      <score-badge :lamp="props.row.clearLamp" :score="props.row.score" />
    </b-table-column>
    <b-table-column
      v-slot="props"
      field="exScore"
      :label="$t('exScore')"
      numeric
    >
      {{ props.row.exScore }}
    </b-table-column>
    <b-table-column
      v-slot="props"
      :visible="$accessor.isLoggedIn"
      :label="$t('edit')"
    >
      <a
        @click="
          scoreEditorModal(
            props.row.id,
            props.row.playStyle,
            props.row.difficulty,
            props.row.isCourse
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
    "name": "曲名",
    "difficulty": "難易度",
    "score": "スコア",
    "exScore": "EXスコア",
    "edit": "スコア編集",
    "noData": "データがありません"
  },
  "en": {
    "name": "Name",
    "difficulty": "Difficulty",
    "score": "Score",
    "exScore": "EX Score",
    "edit": "Edit Score",
    "noData": "No data"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { getCourseInfo } from '~/api/course'
import { getSongInfo } from '~/api/song'
import ScoreEditor from '~/components/modal/ScoreEditor.vue'
import ScoreBadge from '~/components/shared/ScoreBadge.vue'

@Component({ components: { ScoreBadge } })
export default class ScoreListComponent extends Vue {
  @Prop({ required: false, type: Array, default: () => [] })
  readonly scores!: Api.ScoreList[]

  @Prop({ required: false, type: Boolean, default: false })
  readonly loading!: boolean

  get displayedScores() {
    const getLowerDiffName = (d: Song.Difficulty) =>
      Song.difficultyMap.get(d)!.toLowerCase() as Lowercase<Song.DifficultyName>
    return this.scores.map(s => ({
      ...s,
      link: `/${s.isCourse ? 'courses' : 'songs'}/${s.songId}#${s.playStyle}${
        s.difficulty
      }` as const,
      difficultyName: `${
        s.playStyle === 2 ? 'DP' : 'SP'
      }/${Song.difficultyMap.get(s.difficulty)!}` as const,
      class: `is-${getLowerDiffName(s.difficulty)}` as const,
    }))
  }

  async scoreEditorModal(
    songId: string,
    playStyle: number,
    difficulty: number,
    isCourse: boolean
  ) {
    const songData = isCourse
      ? await getCourseInfo(this.$http, songId)
      : await getSongInfo(this.$http, songId)
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
