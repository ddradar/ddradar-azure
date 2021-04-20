<template>
  <section class="section">
    <h1 class="title">{{ pageTitle }}</h1>

    <b-field label="Title">
      <b-input v-model="title" required />
    </b-field>

    <b-field label="Body">
      <b-input v-model="body" required type="textarea" />
    </b-field>

    <b-field>
      <b-switch v-model="pinned">ピン留めする</b-switch>
    </b-field>

    <b-field label="Type">
      <b-select v-model="type" placeholder="Type">
        <option value="is-info">情報</option>
        <option value="is-warning">警告</option>
        <option value="is-danger">エラー</option>
      </b-select>
    </b-field>

    <b-field label="Icon">
      <b-field grouped>
        <b-input v-model="icon" :icon-right="icon" />
        <b-button
          type="is-text"
          tag="a"
          href="https://materialdesignicons.com/"
        >
          参考ページ
        </b-button>
      </b-field>
    </b-field>

    <b-field>
      <b-button
        type="is-success"
        :disabled="hasError"
        @click="saveNotification()"
      >
        Save
      </b-button>
    </b-field>
  </section>
</template>

<script lang="ts">
import type { Database } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { getNotificationInfo, postNotification } from '~/api/notification'
import * as popup from '~/utils/popup'

@Component
export default class NotificationEditorPage extends Vue {
  id: string | null = null
  pinned: boolean = false
  type: Database.NotificationType = 'is-info'
  icon: string = ''
  title: string = ''
  body: string = ''
  timeStamp: number | null = null

  get pageTitle() {
    return `${this.id ? 'Update' : 'Add'} Notification`
  }

  get hasError() {
    return !this.title || !this.body
  }

  async asyncData({ $http, params }: Pick<Context, '$http' | 'params'>) {
    const id = params.id
    if (!id) return

    try {
      const notification = await getNotificationInfo($http, id)
      return {
        id,
        pinned: notification.pinned,
        type: notification.type,
        icon: notification.icon,
        title: notification.title,
        body: notification.body,
        timeStamp: notification.timeStamp,
      }
    } catch {}
  }

  async saveNotification() {
    // istanbul ignore next
    const notification = {
      id: this.id || undefined,
      pinned: this.pinned,
      type: this.type,
      icon: this.icon,
      title: this.title,
      body: this.body,
      timeStamp: this.timeStamp || undefined,
    }
    try {
      await postNotification(this.$http, notification)
      popup.success(this.$buefy, 'Success!')
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
  }
}
</script>
