<template>
  <section class="section">
    <h1 class="title">{{ $t('title', [userName]) }}</h1>
    <section>
      <b-field grouped group-multiline>
        <b-field :label="$t('field.playStyle')">
          <b-select v-model.number="playStyle" placeholder="Select">
            <option value="0">{{ $t('field.all') }}</option>
            <option v-for="o in playStyles" :key="o.value" :value="o.value">
              {{ o.name }}
            </option>
          </b-select>
        </b-field>
        <b-field :label="$t('field.difficulty')">
          <b-select v-model.number="difficulty" placeholder="Select">
            <option value="-1">{{ $t('field.all') }}</option>
            <option v-for="o in difficulties" :key="o.value" :value="o.value">
              {{ o.name }}
            </option>
          </b-select>
        </b-field>
        <b-field :label="$t('field.level')">
          <b-select v-model.number="level" placeholder="Select">
            <option value="-1">{{ $t('field.all') }}</option>
            <option v-for="o in levels" :key="o" :value="o">
              {{ o }}
            </option>
          </b-select>
        </b-field>
        <b-field :label="$t('field.clearLamp')">
          <b-select v-model.number="clearLamp" placeholder="Select">
            <option value="-1">{{ $t('field.all') }}</option>
            <option v-for="o in clearLamps" :key="o.value" :value="o.value">
              {{ o.name }}
            </option>
          </b-select>
        </b-field>
        <b-field :label="$t('field.rank')">
          <b-select v-model="rank" placeholder="Select">
            <option value="">{{ $t('field.all') }}</option>
            <option v-for="o in ranks" :key="o" :value="o">
              {{ o }}
            </option>
          </b-select>
        </b-field>
      </b-field>
      <b-field>
        <b-button
          type="is-success"
          :disabled="!user"
          :loading="loading"
          @click="search()"
        >
          {{ $t('search') }}
        </b-button>
      </b-field>
    </section>
    <section>
      <score-list :scores="scores" :loading="loading" />
    </section>
  </section>
</template>

<i18n>
{
  "ja": {
    "title": "スコア詳細 - {0}",
    "field": {
      "all": "(指定しない)",
      "playStyle": "SP/DP",
      "difficulty": "譜面",
      "level": "Lv",
      "clearLamp": "クリア状況",
      "rank": "ダンスレベル"
    },
    "search": "検索"
  },
  "en": {
    "title": "Score Details - {0}",
    "field": {
      "all": "(All)",
      "playStyle": "SP/DP",
      "difficulty": "Diff",
      "level": "Lv",
      "clearLamp": "Clear Status",
      "rank": "Dance Level"
    },
    "search": "Search"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Score, Song } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { getUserScores } from '~/api/score'
import { getUserInfo } from '~/api/user'
import ScoreList from '~/components/pages/users/ScoreList.vue'

@Component({ components: { ScoreList }, fetchOnServer: false })
export default class ScorePage extends Vue {
  user: Api.UserInfo | null = null

  playStyle: Song.PlayStyle | 0 = 0
  difficulty: Song.Difficulty | -1 = -1
  level: number = 0
  clearLamp: Score.ClearLamp | -1 = -1
  rank: Score.DanceLevel | '' = ''

  scores: Api.ScoreList[] = []
  loading: boolean = false

  get playStyles() {
    return [...Song.playStyleMap].map(([value, name]) => ({ name, value }))
  }

  get difficulties() {
    return [...Song.difficultyMap].map(([value, name]) => ({ name, value }))
  }

  get levels() {
    return [...new Array(19).keys()].map(i => i + 1)
  }

  get clearLamps() {
    return [...Score.clearLampMap].map(([value, name]) => ({ name, value }))
  }

  get ranks() {
    return [...Score.danceLevelSet]
  }

  get userName() {
    return this.user?.name ?? ''
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return {
      title: this.$t('title', [this.userName]) as string,
    }
  }

  /** id expected [a-z], [A-Z] [0-9], [-], [_] */
  validate({ params }: Pick<Context, 'params'>) {
    return /^[-a-zA-Z0-9_]+$/.test(params.id)
  }

  async fetch() {
    const id = this.$route.params.id
    try {
      this.user = await getUserInfo(this.$http, id)
    } catch {
      this.user = null
    }
  }

  async search() {
    /* istanbul ignore if */
    if (!this.user) return
    this.loading = true

    try {
      this.scores = await getUserScores(
        this.$http,
        this.user.id,
        this.playStyle === 0 ? undefined : this.playStyle,
        this.difficulty === -1 ? undefined : this.difficulty,
        this.level === 0 ? undefined : this.level,
        this.clearLamp === -1 ? undefined : this.clearLamp,
        this.rank === '' ? undefined : this.rank
      )
    } catch {
      this.scores = []
    }
    this.loading = false
  }
}
</script>
