<template>
  <card :title="title" :type="cardType" collapsible :open="open">
    <div class="card-content">
      <div class="table-container">
        <b-table
          :data="scores"
          :loading="$fetchState.pending"
          :mobile-cards="false"
          :selected="userScore"
          narrowed
          striped
        >
          <b-table-column v-slot="props" field="name" :label="$t('list.name')">
            <nuxt-link
              v-if="!props.row.isArea"
              :to="`/users/${props.row.userId}`"
              class="is-size-7"
            >
              {{ props.row.userName }}
            </nuxt-link>
            <span v-else class="is-size-7">{{ props.row.userName }}</span>
          </b-table-column>
          <b-table-column
            v-slot="props"
            field="score"
            :label="$t('list.score')"
            centered
          >
            <score-badge :lamp="props.row.clearLamp" :score="props.row.score" />
          </b-table-column>
          <b-table-column
            v-slot="props"
            field="exScore"
            :label="$t('list.exScore')"
            numeric
          >
            <span class="is-size-7">{{ props.row.exScore }}</span>
          </b-table-column>

          <template #empty>
            <section class="section">
              <div class="content has-text-grey has-text-centered">
                <p>{{ $t('list.noData') }}</p>
              </div>
            </section>
          </template>
        </b-table>
      </div>
    </div>
    <footer class="card-footer">
      <a
        v-if="$accessor.isLoggedIn"
        class="card-footer-item"
        @click="launchScoreEditor"
      >
        {{ $t('button.edit') }}
      </a>
      <a
        v-if="$accessor.isLoggedIn"
        class="card-footer-item"
        @click="launchScoreImporter"
      >
        {{ $t('button.import') }}
      </a>
      <a class="card-footer-item" @click="fetchAllScores">
        {{ $t('button.all') }}
      </a>
    </footer>
  </card>
</template>

<i18n src="../../i18n/area.json"></i18n>
<i18n>
{
  "ja": {
    "list": {
      "name": "ユーザー名",
      "score": "スコア",
      "exScore": "EX",
      "noData": "データがありません",
      "top": "{area}トップ"
    },
    "button": {
      "edit": "編集",
      "import": "インポート",
      "all": "全件表示"
    },
    "area": {
      "0": "全国"
    }
  },
  "en": {
    "list": {
      "name": "Name",
      "score": "Score",
      "exScore": "EX",
      "noData": "No Data",
      "top": "{area} Top"
    },
    "button": {
      "edit": "Edit",
      "import": "Import",
      "all": "Show All"
    },
    "area": {
      "0": "World"
    }
  }
}
</i18n>

<script lang="ts">
import type { CourseInfo } from '@ddradar/core/api/course'
import type { ScoreInfo } from '@ddradar/core/api/score'
import type { SongInfo } from '@ddradar/core/api/song'
import { difficultyMap, StepChartSchema } from '@ddradar/core/db/songs'
import { areaCodeSet } from '@ddradar/core/db/users'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getChartScore } from '~/api/score'
import { getChartTitle } from '~/api/song'
import ScoreEditor from '~/components/modal/ScoreEditor.vue'
import ScoreImporter from '~/components/modal/ScoreImporter.vue'
import Card from '~/components/shared/Card.vue'
import ScoreBadge from '~/components/shared/ScoreBadge.vue'

type RankingScore = Pick<
  ScoreInfo,
  'userId' | 'userName' | 'score' | 'exScore' | 'clearLamp'
> & { isArea?: true }

@Component({ components: { Card, ScoreBadge }, fetchOnServer: false })
export default class OrderDetailComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly info!: CourseInfo | SongInfo

  @Prop({ required: true, type: Object })
  readonly chart!: Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

  @Prop({ required: false, type: Boolean, default: false })
  readonly open!: boolean

  fetchAllData = false
  scores: RankingScore[] = []

  get userScore() {
    return this.scores.find(s => s.userId === this.$accessor.user?.id)
  }

  get title() {
    return getChartTitle(this.chart)
  }

  get cardType() {
    return `is-${difficultyMap.get(this.chart.difficulty)!.toLowerCase()}`
  }

  async fetch() {
    try {
      const scores = await getChartScore(
        this.$http,
        this.info.id,
        this.chart.playStyle,
        this.chart.difficulty,
        this.fetchAllData ? 'full' : 'medium'
      )
      this.scores = scores.map(s => {
        const areaCodes = [...areaCodeSet].map(i => `${i}`)
        if (areaCodes.includes(s.userId)) {
          return {
            ...s,
            isArea: true,
            userName: this.$t('list.top', {
              area: this.$t(`area.${s.userId}`),
            }) as string,
          }
        }
        return s
      })
    } catch {}
  }

  /** Open ScoreEditor modal */
  launchScoreEditor() {
    this.$buefy.modal
      .open({
        parent: this,
        component: ScoreEditor,
        props: {
          songId: this.info.id,
          playStyle: this.chart.playStyle,
          difficulty: this.chart.difficulty,
          songData: this.info,
        },
        hasModalCard: true,
        trapFocus: true,
      })
      /* istanbul ignore */
      .$on('close', () => this.$fetch())
  }

  /** Open ScoreImporter modal */
  launchScoreImporter() {
    this.$buefy.modal
      .open({
        parent: this,
        component: ScoreImporter,
        props: {
          songId: this.info.id,
          playStyle: this.chart.playStyle,
          difficulty: this.chart.difficulty,
          isCourse: this.info.nameIndex < 0,
        },
        hasModalCard: true,
        trapFocus: true,
      })
      /* istanbul ignore */
      .$on('close', () => this.$fetch())
  }

  /** Call Get Chart Score API */
  fetchAllScores() {
    this.fetchAllData = true
    this.$fetch()
  }
}
</script>
