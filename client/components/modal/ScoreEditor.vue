<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <h1 class="modal-card-title">{{ songData.name }}</h1>
    </header>
    <section class="modal-card-body">
      <!-- Select chart -->
      <h2 v-if="selectedChart" class="subtitle is-small">
        {{ chartName }}
      </h2>
      <b-field v-else :label="$t('label.selectChart')">
        <b-select :disabled="selectedChart" @input="onChartSelected">
          <option v-for="c in charts" :key="c.label" :value="c">
            {{ c.label }}
          </option>
        </b-select>
      </b-field>

      <!-- Input score -->
      <template v-if="selectedChart">
        <b-loading :active.sync="isLoading" />
        <b-field grouped>
          <b-field :label="$t('label.score')">
            <b-input
              v-model.number="score"
              type="number"
              required
              placeholder="0-1000000"
              min="0"
              max="1000000"
              step="10"
            />
          </b-field>
          <b-checkbox v-model="isFailed">{{ $t('label.rankE') }}</b-checkbox>
        </b-field>

        <b-field :label="$t('label.clear')">
          <b-select v-model.number="clearLamp" :placeholder="$t('label.clear')">
            <option value="0">Failed</option>
            <option value="1">Assisted Clear</option>
            <option value="2">Clear</option>
            <option value="3">Life4 Clear</option>
            <option value="4">Good Full Combo</option>
            <option value="5">Great Full Combo</option>
            <option value="6">Perfect Full Combo</option>
            <option value="7">Marvelous Full Combo</option>
          </b-select>
        </b-field>

        <b-field :label="$t('label.exScore')">
          <b-input
            v-model.number="exScore"
            type="number"
            min="0"
            :max="exScoreMax"
            :placeholder="`0-${exScoreMax}`"
          />
        </b-field>

        <b-field :label="$t('label.maxCombo')">
          <b-input
            v-model.number="maxCombo"
            type="number"
            min="0"
            :max="maxComboMax"
            :placeholder="`0-${maxComboMax}`"
          />
        </b-field>

        <b-field>
          <b-button type="is-info" icon-left="calculator" @click="calcScore()">
            {{ $t('button.calc') }}
          </b-button>
        </b-field>
      </template>
    </section>

    <footer v-if="selectedChart" class="modal-card-foot">
      <b-button type="is-success" icon-left="content-save" @click="saveScore()">
        {{ $t('button.save') }}
      </b-button>
      <b-button type="is-danger" icon-left="delete" @click="deleteScore()">
        {{ $t('button.delete') }}
      </b-button>
      <b-button type="is-warning" @click="close()">
        {{ $t('button.close') }}
      </b-button>
    </footer>
  </div>
</template>

<i18n>
{
  "ja": {
    "label": {
      "selectChart": "譜面を選択",
      "score": "ハイスコア",
      "rankE": "E判定",
      "clear": "クリア種別",
      "exScore": "EXスコア",
      "maxCombo": "最大コンボ数"
    },
    "button": {
      "calc": "自動計算",
      "save": "保存",
      "delete": "削除",
      "close": "閉じる"
    },
    "message": {
      "cannotCalc": "情報が足りないため、スコアの自動計算ができませんでした。",
      "successSave": "保存しました",
      "deleteScore": "スコアを削除しますか？",
      "successDelete": "削除しました"
    }
  },
  "en": {
    "label": {
      "selectChart": "Select Chart",
      "score": "Score",
      "rankE": "Rank E",
      "clear": "Clear Lamp",
      "exScore": "EX SCORE",
      "maxCombo": "MAX COMBO"
    },
    "button": {
      "calc": "Auto Calc",
      "save": "Save",
      "delete": "Delete",
      "close": "Close"
    },
    "message": {
      "cannotCalc": "Cannot guess score due to lack of information.",
      "successSave": "Saved",
      "deleteScore": "Do you delete this score?",
      "successDelete": "Deleted"
    }
  }
}
</i18n>

<script lang="ts">
import type { Database } from '@ddradar/core'
import { Score, Song } from '@ddradar/core'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { deleteChartScore, getChartScore, postChartScore } from '~/api/score'
import * as popup from '~/utils/popup'

type ChartSchema = Omit<
  Database.StepChartSchema | Database.CourseChartSchema,
  'level'
>
type SongOrCourseInfo = { name: string; charts: ChartSchema[] }

@Component({ fetchOnServer: false })
export default class ScoreEditorComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly songId!: string

  @Prop({ required: false, type: Number, default: null })
  readonly playStyle!: Song.PlayStyle | null

  @Prop({ required: false, type: Number, default: null })
  readonly difficulty!: Song.Difficulty | null

  @Prop({ required: true, type: Object })
  readonly songData!: SongOrCourseInfo

  score = 0
  exScore = 0
  clearLamp: Score.ClearLamp = 0
  maxCombo = 0
  isFailed = false

  selectedChart: ChartSchema | null = null

  isLoading = true

  get rank() {
    return this.isFailed ? 'E' : Score.getDanceLevel(this.score)
  }

  get exScoreMax() {
    if (!this.selectedChart) return 0
    return (
      (this.selectedChart.notes +
        this.selectedChart.freezeArrow +
        this.selectedChart.shockArrow) *
      3
    )
  }

  get chartName() {
    if (!this.selectedChart) return null
    const playStyle = Song.playStyleMap.get(this.selectedChart.playStyle)
    const difficulty = Song.difficultyMap.get(this.selectedChart.difficulty)
    return `${playStyle}/${difficulty}`
  }

  get maxComboMax() {
    if (!this.selectedChart) return 0
    return this.selectedChart.notes + this.selectedChart.shockArrow
  }

  get charts() {
    return this.songData.charts.map(c => ({
      playStyle: c.playStyle,
      difficulty: c.difficulty,
      label: `${Song.playStyleMap.get(c.playStyle)}/${Song.difficultyMap.get(
        c.difficulty
      )}`,
    }))
  }

  async created() {
    if (this.playStyle !== null && this.difficulty !== null) {
      this.selectedChart =
        this.songData.charts.find(
          c =>
            c.playStyle === this.playStyle && c.difficulty === this.difficulty
        ) ?? null
      await this.fetchScore()
    }
  }

  async onChartSelected({
    playStyle,
    difficulty,
  }: Pick<ChartSchema, 'playStyle' | 'difficulty'>) {
    this.selectedChart =
      this.songData.charts.find(
        c => c.playStyle === playStyle && c.difficulty === difficulty
      ) ?? null
    await this.fetchScore()
  }

  calcScore() {
    /* istanbul ignore if */
    if (!this.selectedChart) return
    try {
      const score = Score.setValidScoreFromChart(this.selectedChart, {
        score: this.score,
        exScore: this.exScore,
        maxCombo: this.maxCombo,
        clearLamp: this.clearLamp,
        rank: this.isFailed ? 'E' : undefined,
      })
      this.score = score.score
      this.exScore = score.exScore ?? this.exScore
      this.maxCombo = score.maxCombo ?? this.maxCombo
      this.clearLamp = score.clearLamp
      this.isFailed = score.rank === 'E'
    } catch {
      popup.warning(this.$buefy, this.$t('message.cannotCalc') as string)
    }
  }

  async saveScore() {
    /* istanbul ignore if */
    if (!this.selectedChart) return
    const playStyle = this.selectedChart.playStyle
    const difficulty = this.selectedChart.difficulty
    try {
      await postChartScore(this.$http, this.songId, playStyle, difficulty, {
        score: this.score,
        exScore: this.exScore,
        maxCombo: this.maxCombo,
        clearLamp: this.clearLamp,
        rank: this.rank,
      })
      popup.success(this.$buefy, this.$t('message.successSave') as string)
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
    this.close()
  }

  deleteScore() {
    this.$buefy.dialog.confirm({
      message: this.$t('message.deleteScore') as string,
      type: 'is-warning',
      hasIcon: true,
      onConfirm: async () => {
        await this.callDeleteAPI()
        this.close()
      },
    })
  }

  async fetchScore() {
    if (!this.selectedChart) return
    this.isLoading = true
    const playStyle = this.selectedChart.playStyle
    const difficulty = this.selectedChart.difficulty
    try {
      const scores = await getChartScore(
        this.$http,
        this.songId,
        playStyle,
        difficulty,
        'private'
      )
      this.score = scores[0].score
      this.exScore = scores[0].exScore ?? this.exScore
      this.clearLamp = scores[0].clearLamp
      this.maxCombo = scores[0].maxCombo ?? this.maxCombo
      this.isFailed = scores[0].rank === 'E'
    } catch (error) {
      this.isLoading = false
      const message = error.message ?? error
      if (message !== '404') {
        popup.danger(this.$buefy, message)
      }
    }
    this.isLoading = false
  }

  private async callDeleteAPI() {
    /* istanbul ignore if */
    if (!this.selectedChart) return
    const playStyle = this.selectedChart.playStyle
    const difficulty = this.selectedChart.difficulty
    try {
      await deleteChartScore(this.$http, this.songId, playStyle, difficulty)
      popup.success(this.$buefy, this.$t('message.successDelete') as string)
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
  }

  close() {
    // @ts-ignore
    this.$parent.close()
  }
}
</script>
