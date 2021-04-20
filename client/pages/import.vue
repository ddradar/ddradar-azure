<template>
  <section class="section">
    <h1 class="title">{{ $t('title') }}</h1>
    <h2 id="eagate" class="subtitle">{{ $t('subtitle.eagate') }}</h2>
    <div class="content">
      <b-field>
        <b-input v-model="bookmarklet" readonly />
        <b-button icon-left="content-copy" @click="copyToClipboard" />
      </b-field>
      <ol>
        <li>
          <i18n path="content.eagate.text_1">
            <nuxt-link to="/profile" target="_blank">
              {{ $t('content.eagate.text_1_0') }}
            </nuxt-link>
          </i18n>
        </li>
        <li>{{ $t('content.eagate.text_2') }}</li>
        <li>
          <i18n path="content.eagate.text_3_1">
            <a
              href="https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html"
              target="_blank"
            >
              {{ $t('content.eagate.text_3_1_0') }}
            </a>
          </i18n>
          <wbr />
          <strong>{{ $t('content.eagate.text_3_2') }}</strong>
        </li>
        <li>{{ $t('content.eagate.text_4') }}</li>
        <li>{{ $t('content.eagate.text_5') }}</li>
      </ol>
    </div>
    <h2 id="skillAttack" class="subtitle">{{ $t('subtitle.skillAttack') }}</h2>
    <div class="content">
      <i18n path="content.skillAttack.text_1" tag="p">
        <a href="http://skillattack.com/sa4/" target="_blank">Skill Attack</a>
      </i18n>
      <i18n path="content.skillAttack.text_2" tag="p">
        <a v-if="skillAttackUri" :href="skillAttackUri" target="_blank">
          {{ $t('content.skillAttack.text_2_0') }}
        </a>
        <span v-else>
          {{ $t('content.skillAttack.text_2_0') }} (score_00000000.txt)
        </span>
      </i18n>
      <b-field class="file is-primary" :class="{ 'has-name': !!file }">
        <b-upload v-model="file" class="file-label" accept=".txt">
          <span class="file-cta">
            <b-icon class="file-icon" icon="upload" />
            <span class="file-label">
              {{ file ? file.name : $t('upload') }}
            </span>
          </span>
        </b-upload>
        <b-button v-if="file" icon-left="window-close" @click="file = null" />
      </b-field>
      <b-field>
        <b-button
          type="is-success"
          :disabled="!file"
          :loading="loading"
          @click="importSkillAttackScores()"
        >
          {{ $t('submit') }}
        </b-button>
      </b-field>
      <b-progress
        v-if="file && loading"
        type="is-success"
        :value="doneCount"
        :max="maxCount"
        show-value
      >
        {{ message }}
      </b-progress>
    </div>
  </section>
</template>

<i18n>
{
  "ja": {
    "title": "スコアのインポート",
    "subtitle": {
      "eagate": "e-amusementサイトからインポート",
      "skillAttack": "Skill Attackからインポート"
    },
    "content": {
      "eagate": {
        "text_1": "{0}にて、インポート用のパスワードを登録します。",
        "text_1_0": "「ユーザー設定」ページ",
        "text_2": "上記のテキストをコピーして、ブックマークに登録します。",
        "text_3_1": "公式サイトの{0}を開きます。",
        "text_3_1_0": "「楽曲データ一覧」ページ",
        "text_3_2": "ベーシックコースへの加入が必要です。",
        "text_4": "登録したブックマークを開きます。",
        "text_5": "ユーザーID、パスワードを入力します。"
      },
      "skillAttack": {
        "text_1": "{0}より、スコアをインポートします。",
        "text_2": "事前に{0}をダウンロードして、下記よりアップロードを実行してください。",
        "text_2_0": "スコアデータ一覧"
      }
    },
    "submit": "登録",
    "upload": "ファイルを選択",
    "progress": "登録中: {song} ({done}/{max})",
    "popup": {
      "invalidFile": "ファイルが読み取れないか、正しい形式ではありません",
      "success": "{n}件のスコアを登録しました",
      "copied": "コピーしました"
    }
  },
  "en": {
    "title": "Import Scores",
    "subtitle": {
      "eagate": "Import from e-amusement GATE",
      "skillAttack": "Import from Skill Attack"
    },
    "content": {
      "eagate": {
        "text_1": "Regist your password for import at {0}.",
        "text_1_0": "\"User Settings\" page",
        "text_2": "Copy above text and add it for bookmarklet.",
        "text_3_1": "Open {0}.",
        "text_3_1_0": "\"Music List\" page",
        "text_3_2": "You need to subscribe \"e-amusement Basic Course\" to see scores.",
        "text_4": "Launch bookmarklet.",
        "text_5": "Enter your ID and pass."
      },
      "skillAttack": {
        "text_1": "Import your scores from {0}.",
        "text_2": "Please download {0} in advance, and upload here.",
        "text_2_0": "Score Data"
      }
    },
    "submit": "Submit",
    "upload": "Select file",
    "progress": "Uploading: {song} ({done}/{max})",
    "popup": {
      "invalidFile": "Cannot read file or invalid file",
      "success": "Uploaded: {n} song | Uploaded: {n} songs",
      "copied": "Copied"
    }
  }
}
</i18n>

<script lang="ts">
import { readTextAsync, scoreTexttoScoreList } from '@ddradar/core'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { postSongScores } from '~/api/score'
import * as popup from '~/utils/popup'

@Component
export default class ImportPage extends Vue {
  loading = false
  maxCount = 0
  doneCount = 0
  currentSong = ''
  file: File | null = null

  get message() {
    return this.$t('progress', {
      song: this.currentSong,
      done: this.doneCount,
      max: this.maxCount,
    })
  }

  get bookmarklet() {
    const domain = process.client
      ? document.domain
      : /* istanbul ignore next */ 'www.ddradar.app'
    const region = this.$i18n.locale
    return `javascript:(function(d){d.body.appendChild(d.createElement('script')).src='https://${domain}/eagate.${region}.min.js';})(document);`
  }

  get skillAttackUri() {
    const code = this.$accessor.user?.code
    return code
      ? `http://skillattack.com/sa4/data/dancer/${code}/score_${code}.txt`
      : ''
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return { title: this.$t('title') as string }
  }

  async copyToClipboard() {
    await navigator.clipboard.writeText(this.bookmarklet)
    popup.success(this.$buefy, this.$t('popup.copied') as string)
  }

  /** Convert file to Scores and call Post Song Scores API */
  async importSkillAttackScores() {
    if (!this.file) return

    this.loading = true
    this.maxCount = 0
    this.doneCount = 0

    try {
      const text = await readTextAsync(this.file)
      const scoreList = scoreTexttoScoreList(text)
      await this.callPostAPI(scoreList)
    } catch {
      popup.warning(this.$buefy, this.$t('popup.invalidFile') as string)
      this.loading = false
    }
  }

  private async callPostAPI(
    scoreList: ReturnType<typeof scoreTexttoScoreList>
  ) {
    this.maxCount = Object.keys(scoreList).length

    for (const songId in scoreList) {
      const scores = scoreList[songId]
      try {
        if (scores && scores.length > 0) {
          this.currentSong = scores[0].songName
          await postSongScores(this.$http, songId, scores)
        }
        this.doneCount++
      } catch (error) {
        popup.danger(this.$buefy, error.message ?? error)
        this.maxCount = 0
        this.doneCount = 0
        this.currentSong = ''
        this.loading = false
        return
      }
    }

    popup.success(
      this.$buefy,
      this.$tc('popup.success', this.doneCount) as string
    )
    this.maxCount = 0
    this.doneCount = 0
    this.currentSong = ''
    this.loading = false
  }
}
</script>
