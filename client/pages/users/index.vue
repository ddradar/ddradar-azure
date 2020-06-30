<template>
  <section class="section">
    <section>
      <b-field grouped group-multiline>
        <b-field label="所属地域">
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
        <b-field label="登録名(部分一致)">
          <b-input v-model="name" />
        </b-field>
        <b-field label="DDR CODE">
          <b-input
            v-model.number="code"
            placeholder="10000000"
            minlength="8"
            maxlength="8"
            pattern="^\d{8}$"
          />
        </b-field>
        <b-field>
          <b-button type="is-success" @click="search()">
            検索
          </b-button>
        </b-field>
      </b-field>
    </section>

    <section>
      <b-table
        :data="users"
        striped
        :loading="loading"
        :mobile-cards="false"
        paginated
        per-page="50"
      >
        <template slot-scope="props">
          <b-table-column field="name" label="Name">
            <nuxt-link :to="`/users/${props.row.id}`">
              {{ props.row.name }}
            </nuxt-link>
          </b-table-column>
          <b-table-column field="area" label="Area">
            {{ getAreaName(props.row.area) }}
          </b-table-column>
        </template>
      </b-table>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { AreaCode, areaList, User } from '~/types/api/user'

type UserListResponse = {
  next: string | null
  result: User[]
}

@Component
export default class UserListPage extends Vue {
  name: string = ''
  area: AreaCode = 0
  code: number | null = null
  users: User[] = []

  loading = false

  readonly areaOptions = Object.entries(areaList).map(v => ({
    key: v[0],
    value: v[1],
  }))

  getAreaName(areaCode: AreaCode) {
    return areaList[areaCode]
  }

  /** Load user info */
  async search() {}
}
</script>