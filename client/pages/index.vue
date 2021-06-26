<template>
  <div>
    <section class="section">
      <template v-if="$fetchState.pending">
        <b-skeleton animated />
        <b-skeleton animated />
        <b-skeleton animated />
      </template>
      <top-message
        v-for="m in messages"
        v-else
        :key="m.id"
        :type="m.type"
        :icon="m.icon"
        :title="m.title"
        :body="m.body"
        :time="m.timeStamp"
      />
      <div class="has-text-right top-notification">
        <nuxt-link to="/notification">{{ $t('old_notification') }}</nuxt-link>
      </div>
    </section>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">DDRadar</h1>
          <p class="subtitle">{{ $t('subtitle') }}</p>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="columns is-multiline">
        <section
          v-for="m in menuList"
          :key="m.label"
          class="
            column
            is-half-tablet is-one-third-desktop is-one-quarter-widescreen
          "
        >
          <card :title="m.label" type="is-primary" collapsible>
            <div class="card-content">
              <div class="buttons">
                <b-button
                  v-for="i in m.items"
                  :key="i.name"
                  type="is-text"
                  tag="nuxt-link"
                  :to="i.to"
                >
                  {{ i.name }}
                </b-button>
              </div>
            </div>
          </card>
        </section>
      </div>
    </section>
  </div>
</template>

<i18n>
{
  "ja": {
    "old_notification": "過去のお知らせ一覧",
    "subtitle": "DDR Score Tracker",
    "search": {
      "name": "曲名から探す",
      "single": "SINGLEのレベルから探す",
      "double": "DOUBLEのレベルから探す",
      "series": "バージョンから探す",
      "course": "コースデータ"
    },
    "grade": "段位認定({series})",
    "nonstop": "NONSTOP({series})"
  },
  "en": {
    "old_notification": "Old Notification",
    "subtitle": "DDR Score Tracker",
    "search": {
      "name": "Choose by Name",
      "single": "Choose by SINGLE LV",
      "double": "Choose by DOUBLE LV",
      "series": "Choose by Version",
      "course": "Choose by Courses"
    },
    "grade": "GRADE({series})",
    "nonstop": "NONSTOP({series})"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { getNotificationList } from '~/api/notification'
import { shortenSeriesName } from '~/api/song'
import TopMessage from '~/components/pages/TopMessage.vue'
import Card from '~/components/shared/Card.vue'
import * as popup from '~/utils/popup'

@Component({ components: { Card, TopMessage }, fetchOnServer: false })
export default class IndexPage extends Vue {
  messages: Api.NotificationListData[] = []

  get head(): MetaInfo {
    return { title: 'DDRadar - DDR Score Tracker', titleTemplate: '' }
  }

  get menuList() {
    const seriesList = [...Song.seriesSet]
    return [
      {
        label: this.$t('search.name'),
        items: [...Song.nameIndexMap.entries()].map(([i, s]) => ({
          name: s,
          to: `/name/${i}` as const,
        })),
      },
      {
        label: this.$t('search.single'),
        items: [...Array(19).keys()].map(i => ({
          name: `${i + 1}` as const,
          to: `/single/${i + 1}` as const,
        })),
      },
      {
        label: this.$t('search.double'),
        items: [...Array(19).keys()].map(i => ({
          name: `${i + 1}` as const,
          to: `/double/${i + 1}` as const,
        })),
      },
      {
        label: this.$t('search.series'),
        items: seriesList
          .map((name, i) => ({
            name: shortenSeriesName(name),
            to: `/series/${i}` as const,
          }))
          .reverse(),
      },
      {
        label: this.$t('search.course'),
        items: ([16, 17] as const)
          .map(i => [
            {
              name: this.$t('nonstop', {
                series: shortenSeriesName(seriesList[i]),
              }),
              to: `/nonstop/${i}` as const,
            },
            {
              name: this.$t('grade', {
                series: shortenSeriesName(seriesList[i]),
              }),
              to: `/grade/${i}` as const,
            },
          ])
          .flat(),
      },
    ]
  }

  async fetch() {
    try {
      this.messages = await getNotificationList(this.$http, true)
    } catch (error) {
      const message = error.message ?? error
      if (message !== '404') {
        popup.danger(this.$buefy, message)
      }
    }
  }
}
</script>

<style scoped>
.top-notification {
  padding: 0.75rem 0.75rem 0 0.75rem;
}
</style>
