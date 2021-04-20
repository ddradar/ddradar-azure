<template>
  <section class="section">
    <b-message v-if="isNewUser" type="is-danger" has-icon>
      {{ $t('newUser') }}
    </b-message>
    <h1 class="title">{{ $t('title') }}</h1>

    <b-field :type="type" :message="message">
      <template slot="label">
        {{ $t('field.id') }}
        <b-tooltip type="is-dark" position="is-right" :label="$t('text.id')">
          <b-icon size="is-small" icon="help-circle-outline" />
        </b-tooltip>
      </template>
      <b-input
        v-model="id"
        :placeholder="$t('placeholder.id')"
        :disabled="!isNewUser"
        :loading="loading"
        @blur="checkId()"
      />
    </b-field>

    <b-field :label="$t('field.name')">
      <b-input v-model="name" required />
    </b-field>

    <b-field>
      <template slot="label">
        {{ $t('field.area') }}
        <b-tooltip type="is-dark" position="is-right" :label="$t('text.area')">
          <b-icon size="is-small" icon="help-circle-outline" />
        </b-tooltip>
      </template>
      <b-select
        v-model.number="area"
        :placeholder="$t('placeholder.area')"
        :disabled="!isNewUser"
      >
        <option v-for="area in areaOptions" :key="area.key" :value="area.key">
          {{ area.value }}
        </option>
      </b-select>
    </b-field>

    <b-field :label="$t('field.ddrCode')">
      <b-input
        v-model.number="code"
        :placeholder="$t('placeholder.ddrCode')"
        minlength="8"
        maxlength="8"
        pattern="^\d{8}$"
      />
    </b-field>

    <b-field>
      <template slot="label">
        {{ $t('field.password') }}
        <b-tooltip
          type="is-dark"
          position="is-right"
          :label="$t('text.password')"
        >
          <b-icon size="is-small" icon="help-circle-outline" />
        </b-tooltip>
      </template>
      <b-input v-model="password" type="password" password-reveal />
    </b-field>

    <b-field grouped group-multiline>
      <b-switch v-model="isPublic">{{ $t('field.isPublic') }}</b-switch>
      <div class="help">
        <p v-if="isPublic">
          {{ $t('text.isPublic.public_0') }}<br />
          {{ $t('text.isPublic.public_1') }}
        </p>
        <p v-else>
          {{ $t('text.isPublic.private_0') }}<br />
          {{ $t('text.isPublic.private_1') }}
        </p>
        <p class="has-text-weight-bold has-text-danger">
          <b-icon size="is-small" icon="alert" />
          {{ $t('text.isPublic.caution') }}
        </p>
      </div>
    </b-field>

    <b-field>
      <b-button type="is-success" :disabled="hasError" @click="save()">
        {{ $t('save') }}
      </b-button>
    </b-field>
  </section>
</template>

<i18n src="../i18n/area.json"></i18n>
<i18n>
{
  "ja": {
    "newUser": "ユーザー登録は、まだ完了していません。引き続き、以下の情報を入力してください。",
    "title": "ユーザー設定",
    "field": {
      "id": "ID",
      "name": "表示名",
      "area": "所属地域",
      "ddrCode": "DDR CODE(任意)",
      "password": "インポート用パスワード(任意)",
      "isPublic": "公開する"
    },
    "text": {
      "id": "登録後の変更はできません。",
      "area": "登録後の変更はできません。",
      "password": "外部インポートを利用しない場合は空欄にしてください。",
      "isPublic": {
        "public_0": "ユーザー検索に表示され、ユーザーページは誰でも閲覧できるようになります。",
        "public_1": "これから登録するスコアはランキングに自動登録され、一般公開されます。",
        "private_0": "ユーザー検索に表示されず、ユーザーページはあなたしか閲覧できません。",
        "private_1": "これから登録するスコアは非公開となります。",
        "caution": "ONからOFFにしても、今までに登録したスコアは非公開になりません。ご注意ください。"
      }
    },
    "placeholder": {
      "id": "ID",
      "area": "Select",
      "ddrCode": "10000000"
    },
    "message": {
      "id": {
        "required": "ユーザーIDは必須です",
        "invalid": "ユーザーIDは半角英数字, ハイフン, アンダーバーのみ使用可能です",
        "duplicate": "ユーザーIDはすでに使われています",
        "available": "ユーザーIDは使用可能です"
      },
      "success": "保存しました"
    },
    "save": "保存"
  },
  "en": {
    "newUser": "User registration has not been completed yet. Please continue to enter the following information.",
    "title": "User Settings",
    "field": {
      "id": "ID",
      "name": "Display Name",
      "area": "Area",
      "ddrCode": "DDR CODE(optional)",
      "password": "Password for Import(optional)",
      "isPublic": "Public"
    },
    "text": {
      "id": "can not be changed after registration.",
      "area": "can not be changed after registration.",
      "password": "keep it blank if you do not use external import.",
      "isPublic": {
        "public_0": "You will be shown in the user search and your page will be visible to anyone.",
        "public_1": "Registered scores will be public.",
        "private_0": "You are not shown in the user search and the user page is only visible to you.",
        "private_1": "Registered scores will be private.",
        "caution": "Note: Even if you turn off, the scores so far will not be private."
      }
    },
    "placeholder": {
      "id": "ID",
      "area": "Select",
      "ddrCode": "10000000"
    },
    "message": {
      "id": {
        "required": "ID is required",
        "invalid": "Only alphanumeric characters, hyphens, and underbars can be used for ID",
        "duplicate": "User ID is already in use",
        "available": "This ID is available"
      },
      "success": "Saved"
    },
    "save": "Save"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Database } from '@ddradar/core'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { existsUser } from '~/api/user'
import * as popup from '~/utils/popup'

@Component({ fetchOnServer: false })
export default class ProfilePage extends Vue {
  id: string = ''
  name: string = ''
  area: Database.AreaCode = 0
  code: number | null = null
  password: string = ''
  isPublic: boolean = true

  loading = false
  type: '' | 'is-success' | 'is-danger' = ''
  message = ''

  get areaOptions() {
    return [...Database.areaCodeSet].map(key => ({
      key,
      value: this.$t(`area.${key}`),
    }))
  }

  get isNewUser() {
    return !this.$accessor.user
  }

  get hasError() {
    return (
      this.type === 'is-danger' ||
      !/^[-a-zA-Z0-9_]+$/.test(this.id) ||
      !this.name ||
      !(Database.areaCodeSet as ReadonlySet<number>).has(this.area) ||
      (!!this.code &&
        (!Number.isInteger(this.code) ||
          this.code < 10000000 ||
          this.code > 99999999))
    )
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return {
      title: this.$t('title') as string,
    }
  }

  /** Load user info */
  async fetch() {
    await this.$accessor.fetchUser()
    this.id = this.$accessor.user?.id ?? this.$accessor.auth?.userDetails ?? ''
    this.name = this.$accessor.user?.name ?? ''
    this.area = this.$accessor.user?.area ?? 0
    this.code = this.$accessor.user?.code ?? null
    this.password = this.$accessor.user?.password ?? ''
    this.isPublic = this.$accessor.user?.isPublic ?? true
  }

  async checkId() {
    this.type = ''

    // Required check
    if (!this.id) {
      this.type = 'is-danger'
      this.message = this.$t('message.id.required').toString()
      return
    }

    // Pattern check
    if (!/^[-a-zA-Z0-9_]+$/.test(this.id)) {
      this.type = 'is-danger'
      this.message = this.$t('message.id.invalid').toString()
      return
    }

    // Duplicate check from API
    this.loading = true
    try {
      const exists = await existsUser(this.$http, this.id)
      if (exists) {
        this.type = 'is-danger'
        this.message = this.$t('message.id.duplicate').toString()
      } else {
        this.type = 'is-success'
        this.message = this.$t('message.id.available').toString()
      }
    } catch (error) {
      this.type = ''
    }
    this.loading = false
  }

  async save() {
    const user: Api.CurrentUserInfo = {
      id: this.id,
      name: this.name,
      area: this.area,
      isPublic: this.isPublic,
    }
    if (this.code) user.code = this.code
    if (this.password) user.password = this.password
    try {
      await this.$accessor.saveUser(user)
      popup.success(this.$buefy, this.$t('message.success').toString())
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
    this.type = ''
    this.message = ''
  }
}
</script>
