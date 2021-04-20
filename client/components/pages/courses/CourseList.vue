<template>
  <b-table
    :data="displayedCourses"
    striped
    :loading="loading"
    :mobile-cards="false"
    paginated
    per-page="50"
  >
    <b-table-column v-slot="props" field="series" :label="$t('series')">
      {{ props.row.series }}
    </b-table-column>
    <b-table-column v-slot="props" field="name" :label="$t('name')">
      <nuxt-link :to="`/courses/${props.row.id}`">
        {{ props.row.name }}
      </nuxt-link>
    </b-table-column>
    <b-table-column v-slot="props" field="type" :label="$t('type')">
      {{ props.row.type }}
    </b-table-column>

    <template #empty>
      <section v-if="loading" class="section">
        <b-skeleton animated />
        <b-skeleton animated />
        <b-skeleton animated />
      </section>
      <section v-else class="section">
        <div class="content has-text-grey has-text-centered">
          <p>{{ $t('noData') }}</p>
        </div>
      </section>
    </template>
  </b-table>
</template>

<i18n>
{
  "ja": {
    "series": "バージョン",
    "name": "名称",
    "type": "タイプ",
    "nonstop": "NONSTOP",
    "grade": "段位認定",
    "noData": "データがありません"
  },
  "en": {
    "series": "Series",
    "name": "Name",
    "type": "Type",
    "nonstop": "NONSTOP",
    "grade": "GRADE",
    "noData": "No Data"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { shortenSeriesName } from '~/api/song'

@Component
export default class CourseListComponent extends Vue {
  @Prop({ type: Array, required: false, default: () => [] })
  readonly courses!: Api.CourseListData[]

  @Prop({ type: Boolean, required: false, default: false })
  readonly loading!: boolean

  get displayedCourses() {
    return this.courses.map(c => ({
      id: c.id,
      name:
        c.charts.length > 1
          ? c.name
          : `${c.name}(${Song.playStyleMap.get(c.charts[0].playStyle)})`,
      series: shortenSeriesName(c.series),
      type: c.charts.length > 1 ? this.$t('nonstop') : this.$t('grade'),
    }))
  }
}
</script>
