<template>
  <section class="section">
    <template v-if="$fetchState.pending">
      <b-skeleton class="title" animated />
      <b-skeleton class="subtitle" animated />
    </template>
    <template v-else-if="user">
      <h1 class="title">{{ user.name }}</h1>
      <h2 v-if="user" class="subtitle">{{ areaName }} / {{ ddrCode }}</h2>

      <div v-if="isSelfPage" class="buttons">
        <b-button
          icon-left="import"
          type="is-primary"
          tag="nuxt-link"
          to="/import"
        >
          {{ $t('button.import') }}
        </b-button>
        <b-button
          icon-left="account-cog"
          type="is-info"
          tag="nuxt-link"
          to="/profile"
        >
          {{ $t('button.settings') }}
        </b-button>
      </div>

      <section v-if="user" class="section">
        <div class="content columns is-multiline">
          <template v-for="(style, i) in ['SP', 'DP']">
            <section
              :key="`radar-${style}`"
              class="
                column
                is-half-tablet is-one-third-desktop is-one-quarter-widescreen
              "
            >
              <card
                :title="$t('title.radar', [style])"
                type="is-primary"
                collapsible
              >
                <div class="card-content">
                  <b-loading v-if="$fetchState.pending" />
                  <groove-radar
                    v-else-if="radars[i]"
                    class="chart"
                    :chart="radars[i]"
                  />
                  <div v-else class="content has-text-grey has-text-centered">
                    <p>{{ $t('noData') }}</p>
                  </div>
                </div>
              </card>
            </section>
            <section
              :key="`clear-${style}`"
              class="
                column
                is-half-tablet is-one-third-desktop is-one-quarter-widescreen
              "
            >
              <card
                :title="$t('title.clear', [style])"
                type="is-primary"
                collapsible
              >
                <div class="card-content">
                  <b-loading v-if="$fetchState.pending" />
                  <clear-status
                    v-else-if="totalClears[i]"
                    title="ALL"
                    class="chart"
                    :statuses="totalClears[i]"
                  />
                  <div v-else class="content has-text-grey has-text-centered">
                    <p>{{ $t('noData') }}</p>
                  </div>
                </div>
              </card>
            </section>
            <section
              :key="`score-${style}`"
              class="
                column
                is-half-tablet is-one-third-desktop is-one-quarter-widescreen
              "
            >
              <card
                :title="$t('title.score', [style])"
                type="is-primary"
                collapsible
              >
                <div class="card-content">
                  <b-loading v-if="$fetchState.pending" />
                  <score-status
                    v-else-if="totalScores[i]"
                    title="ALL"
                    class="chart"
                    :statuses="totalScores[i]"
                  />
                  <div v-else class="content has-text-grey has-text-centered">
                    <p>{{ $t('noData') }}</p>
                  </div>
                </div>
              </card>
            </section>
            <section
              :key="`clearEach-${style}`"
              class="
                column
                is-half-tablet is-one-third-desktop is-one-quarter-widescreen
              "
            >
              <card
                :title="$t('title.clearEach', [style])"
                type="is-primary"
                collapsible
              >
                <div class="card-content">
                  <b-loading v-if="$fetchState.pending" />
                  <b-carousel
                    v-if="clears[i].length"
                    :autoplay="false"
                    :arrow-hover="false"
                    :indicator-inside="false"
                    indicator-custom
                  >
                    <b-carousel-item v-for="c in clears[i]" :key="c.level">
                      <clear-status
                        class="chart"
                        :title="c.title"
                        :statuses="c.statuses"
                      />
                    </b-carousel-item>
                    <template #indicators="props">
                      {{ clears[i][props.i].title }}
                    </template>
                  </b-carousel>
                  <div v-else class="content has-text-grey has-text-centered">
                    <p>{{ $t('noData') }}</p>
                  </div>
                </div>
              </card>
            </section>
            <section
              :key="`scoreEach-${style}`"
              class="
                column
                is-half-tablet is-one-third-desktop is-one-quarter-widescreen
              "
            >
              <card
                :title="$t('title.score', [style])"
                type="is-primary"
                collapsible
              >
                <div class="card-content">
                  <b-loading v-if="$fetchState.pending" />
                  <b-carousel
                    v-if="scores[i].length"
                    :autoplay="false"
                    :arrow-hover="false"
                    :indicator-inside="false"
                    indicator-custom
                  >
                    <b-carousel-item v-for="c in scores[i]" :key="c.level">
                      <score-status
                        :title="c.title"
                        class="chart"
                        :statuses="c.statuses"
                      />
                    </b-carousel-item>
                    <template #indicators="props">
                      {{ scores[i][props.i].title }}
                    </template>
                  </b-carousel>
                  <div v-else class="content has-text-grey has-text-centered">
                    <p>{{ $t('noData') }}</p>
                  </div>
                </div>
              </card>
            </section>
          </template>
        </div>
      </section>
    </template>
    <template v-else>{{ $t('empty') }}</template>
  </section>
</template>

<i18n src="../../../i18n/area.json"></i18n>
<i18n>
{
  "ja": {
    "pageTitle": "ユーザー詳細",
    "button": {
      "import": "スコアのインポート",
      "settings": "設定"
    },
    "title": {
      "radar": "グルーブレーダー ({0})",
      "clear": "クリア状況 ({0})",
      "score": "スコア状況 ({0})",
      "clearEach": "レベル別クリア状況 ({0})",
      "scoreEach": "レベル別スコア状況 ({0})"
    },
    "empty": "ユーザーが存在しないか、非公開に設定されています。",
    "noData": "データがありません"
  },
  "en": {
    "pageTitle": "User Detail",
    "button": {
      "import": "Import Scores",
      "settings": "Settings"
    },
    "title": {
      "radar": "Groove Radar ({0})",
      "clear": "Clear Status ({0})",
      "score": "Score Status ({0})",
      "clearEach": "Clear Status by Lv ({0})",
      "scoreEach": "Score Status by Lv ({0})"
    },
    "empty": "User does not exist or is private",
    "noData": "No Data"
  }
}
</i18n>

<script lang="ts">
import type { Api, Song } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import {
  getClearStatus,
  getGrooveRadar,
  getScoreStatus,
  getUserInfo,
} from '~/api/user'
import ClearStatus from '~/components/pages/users/ClearStatus.vue'
import GrooveRadar from '~/components/pages/users/GrooveRadar.vue'
import ScoreStatus from '~/components/pages/users/ScoreStatus.vue'
import Card from '~/components/shared/Card.vue'

type ScoreDoughnutProp = {
  level: number
  title: string
  statuses: Pick<Api.ScoreStatus, 'rank' | 'count'>[]
}
type ClearDoughnutProp = {
  level: number
  title: string
  statuses: Pick<Api.ClearStatus, 'clearLamp' | 'count'>[]
}

@Component({
  components: { Card, ClearStatus, GrooveRadar, ScoreStatus },
  fetchOnServer: false,
})
export default class UserPage extends Vue {
  user: Api.UserInfo | null = null
  radars: [Song.GrooveRadar | null, Song.GrooveRadar | null] = [null, null]
  clears: [ClearDoughnutProp[], ClearDoughnutProp[]] = [[], []]
  scores: [ScoreDoughnutProp[], ScoreDoughnutProp[]] = [[], []]

  get areaName() {
    return this.user ? this.$t(`area.${this.user.area}`) : ''
  }

  get ddrCode() {
    return this.user?.code
      ? (String(this.user.code).replace(
          /^(\d{4})(\d{4})$/,
          '$1-$2'
        ) as `${number}-${number}`)
      : ''
  }

  get isSelfPage() {
    const loginId = this.$accessor.user?.id
    return !!this.user && this.user.id === loginId
  }

  get totalClears() {
    return this.clears.map(arr =>
      arr
        .flatMap(c => c.statuses)
        .reduce((p, c) => {
          const matched = p.find(d => d.clearLamp === c.clearLamp)
          if (matched) {
            matched.count += c.count
          } else {
            p.push({ clearLamp: c.clearLamp, count: c.count })
          }
          return p
        }, [] as Pick<Api.ClearStatus, 'clearLamp' | 'count'>[])
    ) as [Api.ClearStatus[], Api.ClearStatus[]]
  }

  get totalScores() {
    return this.scores.map(arr =>
      arr
        .flatMap(c => c.statuses)
        .reduce((p, c) => {
          const matched = p.find(d => d.rank === c.rank)
          if (matched) {
            matched.count += c.count
          } else {
            p.push({ ...c })
          }
          return p
        }, [] as Pick<Api.ScoreStatus, 'rank' | 'count'>[])
    ) as [Api.ScoreStatus[], Api.ScoreStatus[]]
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return {
      title: this.user?.name ?? (this.$t('pageTitle') as string),
    }
  }

  /** id expected [a-z], [A-Z] [0-9], [-], [_] */
  validate({ params }: Pick<Context, 'params'>) {
    return /^[-a-zA-Z0-9_]+$/.test(params.id)
  }

  /** Fetch User info from API */
  async fetch() {
    const id = this.$route.params.id
    try {
      const [user, spRadar, dpRadar, spClears, dpClears, spScores, dpScores] =
        await Promise.all([
          getUserInfo(this.$http, id),
          getGrooveRadar(this.$http, id, 1),
          getGrooveRadar(this.$http, id, 2),
          getClearStatus(this.$http, id, 1),
          getClearStatus(this.$http, id, 2),
          getScoreStatus(this.$http, id, 1),
          getScoreStatus(this.$http, id, 2),
        ])
      this.user = user
      this.radars = [spRadar[0] ?? null, dpRadar[0] ?? null]
      this.clears = [
        spClears
          .reduce((p, c) => {
            const matched = p.find(d => d.level === c.level)
            if (matched) {
              matched.statuses.push({ clearLamp: c.clearLamp, count: c.count })
            } else {
              p.push({
                level: c.level,
                title: `${c.level}`,
                statuses: [{ clearLamp: c.clearLamp, count: c.count }],
              })
            }
            return p
          }, [] as ClearDoughnutProp[])
          .sort((l, r) => l.level - r.level),
        dpClears
          .reduce((p, c) => {
            const matched = p.find(d => d.level === c.level)
            if (matched) {
              matched.statuses.push({ clearLamp: c.clearLamp, count: c.count })
            } else {
              p.push({
                level: c.level,
                title: `${c.level}`,
                statuses: [{ clearLamp: c.clearLamp, count: c.count }],
              })
            }
            return p
          }, [] as ClearDoughnutProp[])
          .sort((l, r) => l.level - r.level),
      ]
      this.scores = [
        spScores
          .reduce((p, c) => {
            const matched = p.find(d => d.level === c.level)
            if (matched) {
              matched.statuses.push({ rank: c.rank, count: c.count })
            } else {
              p.push({
                level: c.level,
                title: `${c.level}`,
                statuses: [{ rank: c.rank, count: c.count }],
              })
            }
            return p
          }, [] as ScoreDoughnutProp[])
          .sort((l, r) => l.level - r.level),
        dpScores
          .reduce((p, c) => {
            const matched = p.find(d => d.level === c.level)
            if (matched) {
              matched.statuses.push({ rank: c.rank, count: c.count })
            } else {
              p.push({
                level: c.level,
                title: `${c.level}`,
                statuses: [{ rank: c.rank, count: c.count }],
              })
            }
            return p
          }, [] as ScoreDoughnutProp[])
          .sort((l, r) => l.level - r.level),
      ]
    } catch {
      this.user = null
    }
  }
}
</script>

<style scoped>
.chart {
  max-height: 80vh;
}
</style>
