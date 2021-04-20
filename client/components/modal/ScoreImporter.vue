<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <h1 class="modal-card-title">{{ $t('title') }}</h1>
    </header>
    <section class="modal-card-body">
      <div class="content">
        <ol>
          <li>{{ $t('process_1') }}</li>
          <i18n path="process_2" tag="li">
            <a target="_blank" :href="musicDetailUri">
              {{ $t('process_2_0') }}
            </a>
          </i18n>
          <li>{{ $t('process_3') }}</li>
        </ol>
      </div>
      <b-field>
        <b-input v-model="sourceCode" type="textarea" required />
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        :disabled="!sourceCode"
        :loading="loading"
        type="is-success"
        @click="importScore()"
      >
        {{ $t('regist') }}
      </b-button>
      <b-button type="is-warning" @click="close()">
        {{ $t('close') }}
      </b-button>
    </footer>
  </div>
</template>

<i18n>
{
  "ja": {
    "title": "スコアのインポート",
    "process_1": "e-amusement GATEにログインしてください。",
    "process_2": "{0}のソースコードを取得し、コピーしてください。",
    "process_2_0": "楽曲データ詳細",
    "process_3": "下のテキストボックスに、コピーしたソースコードを貼り付けてください。",
    "regist": "登録",
    "success": "インポートしました",
    "close": "閉じる"
  },
  "en": {
    "title": "Import Score",
    "process_1": "Login to e-amusement GATE.",
    "process_2": "Get {0} HTML source, and copy it.",
    "process_2_0": "Music Detail's",
    "process_3": "Paste copied text below.",
    "regist": "Import",
    "success": "Imported",
    "close": "Close"
  }
}
</i18n>

<script lang="ts">
import { Gate } from '@ddradar/core'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { postSongScores } from '~/api/score'
import * as popup from '~/utils/popup'

@Component
export default class ScoreImporterComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly songId!: string

  @Prop({ required: true, type: Number })
  readonly playStyle!: 1 | 2

  @Prop({ required: true, type: Number })
  readonly difficulty!: 0 | 1 | 2 | 3 | 4

  @Prop({ required: false, type: Boolean, default: false })
  readonly isCourse!: boolean

  sourceCode: string | null = null
  loading: boolean = false

  get musicDetailUri() {
    /** 0 - 9 */
    const diff = (this.playStyle - 1) * 4 + this.difficulty
    return `https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/${
      this.isCourse ? 'course' : 'music'
    }_detail.html?index=${this.songId}&diff=${diff}`
  }

  async importScore() {
    if (!this.sourceCode) return

    this.loading = true

    // Convert sourceCode to Score
    let score: ReturnType<typeof Gate.musicDetailToScore>
    try {
      score = Gate.musicDetailToScore(this.sourceCode)
    } catch (error) {
      popup.warning(this.$buefy, error.message ?? error)
      this.loading = false
      return
    }

    try {
      await postSongScores(this.$http, this.songId, [score])
      popup.success(this.$buefy, this.$t('success') as string)
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
      this.loading = false
      return
    }

    this.loading = false
    this.close()
  }

  close() {
    // @ts-ignore
    this.$parent.close()
  }
}
</script>
