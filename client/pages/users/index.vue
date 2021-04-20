<template>
  <section class="section">
    <h1 class="title">{{ $t('title') }}</h1>
    <section>
      <b-field grouped group-multiline>
        <b-field :label="$t('field.area')">
          <b-select v-model="area" placeholder="Select">
            <option
              v-for="area in areaOptions"
              :key="area.key"
              :value="area.key"
            >
              {{ area.value }}
            </option>
          </b-select>
        </b-field>
        <b-field :label="$t('field.name')">
          <b-input v-model="name" />
        </b-field>
        <b-field :label="$t('field.code')">
          <b-input
            v-model.number="code"
            placeholder="10000000"
            minlength="8"
            maxlength="8"
            pattern="^\d{8}$"
          />
        </b-field>
      </b-field>
      <b-field>
        <b-button type="is-success" @click="search()">
          {{ $t('search') }}
        </b-button>
      </b-field>
    </section>

    <section>
      <b-table
        :data="displayedUsers"
        striped
        :loading="loading"
        :mobile-cards="false"
        paginated
        per-page="50"
      >
        <b-table-column v-slot="props" field="name" :label="$t('list.name')">
          <nuxt-link :to="`/users/${props.row.id}`">
            {{ props.row.name }}
          </nuxt-link>
        </b-table-column>
        <b-table-column v-slot="props" field="area" :label="$t('list.area')">
          {{ props.row.area }}
        </b-table-column>

        <template #empty>
          <section v-if="loading" class="section">
            <b-skeleton animated />
            <b-skeleton animated />
            <b-skeleton animated />
          </section>
          <section v-else class="section">
            <div class="content has-text-grey has-text-centered">
              <p>{{ $t('list.empty') }}</p>
            </div>
          </section>
        </template>
      </b-table>
    </section>
  </section>
</template>

<i18n src="../../i18n/area.json"></i18n>
<i18n>
{
  "ja": {
    "title": "ユーザーを探す",
    "field": {
      "area": "所属地域",
      "name": "登録名(部分一致)",
      "code": "DDR CODE"
    },
    "list": {
      "name": "登録名",
      "area": "所属地域",
      "empty": "ユーザーが見つかりません"
    },
    "search": "検索"
  },
  "en": {
    "title": "Search User",
    "field": {
      "area": "Area",
      "name": "Name (partial match)",
      "code": "DDR CODE"
    },
    "list": {
      "name": "Name",
      "area": "Area",
      "empty": "Not Found User"
    },
    "search": "Search"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Database } from '@ddradar/core'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { getUserList } from '~/api/user'
import * as popup from '~/utils/popup'

@Component
export default class UserListPage extends Vue {
  name: string = ''
  area: number = 0
  code: number | null = null
  users: Api.UserInfo[] = []

  loading = false

  /** AreaCode - String mapping for <select> components */
  get areaOptions() {
    return [...Database.areaCodeSet].map(key => ({
      key,
      value: this.$t(`area.${key}`),
    }))
  }

  get displayedUsers() {
    return this.users.map(u => ({
      id: u.id,
      name: u.name,
      area: this.$t(`area.${u.area}`),
    }))
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return {
      title: this.$t('title') as string,
    }
  }

  /** Load user info */
  async search() {
    this.loading = true
    try {
      this.users = await getUserList(
        this.$http,
        this.name,
        this.area,
        this.code ?? 0
      )
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
    this.loading = false
  }
}
</script>
