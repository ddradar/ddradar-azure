<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <div class="buttons">
      <b-button
        v-for="link in pageLinks"
        :key="link.name"
        :to="link.to"
        type="is-info"
        tag="nuxt-link"
        :disabled="link.to === $route.path"
        :outlined="link.to === $route.path"
      >
        {{ link.name }}
      </b-button>
    </div>
    <course-list :courses="courses" :loading="$fetchState.pending" />
  </section>
</template>

<i18n>
{
  "ja": {
    "title": "{series} - NONSTOP",
    "grade": "段位認定({series})",
    "nonstop": "NONSTOP({series})"
  },
  "en": {
    "title": "{series} - NONSTOP",
    "grade": "GRADE({series})",
    "nonstop": "NONSTOP({series})"
  }
}
</i18n>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { getCourseList } from '~/api/course'
import { shortenSeriesName } from '~/api/song'
import CourseList from '~/components/pages/courses/CourseList.vue'

@Component({ components: { CourseList }, fetchOnServer: false })
export default class NonstopListPage extends Vue {
  /** Course List from API */
  courses: Api.CourseListData[] = []

  get title() {
    const seriesList = [...Song.seriesSet]
    const series = parseInt(this.$route.params.series, 10)
    return this.$t('title', { series: seriesList[series] })
  }

  get pageLinks() {
    const seriesList = [...Song.seriesSet]
    return [16, 17]
      .flatMap(i =>
        (['nonstop', 'grade'] as const).map(type => [i, type] as const)
      )
      .map(d => ({
        name: this.$t(d[1], { series: shortenSeriesName(seriesList[d[0]]) }),
        to: `/${d[1]}/${d[0]}` as const,
      }))
  }

  /** `series` should be 16 or 17 */
  validate({ params }: Pick<Context, 'params'>) {
    return params.series === '16' || params.series === '17'
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return { title: this.title as string }
  }

  /** Get Course List from API */
  async fetch() {
    const series = parseInt(this.$route.params.series, 10) as 16 | 17
    this.courses = await getCourseList(this.$http, series, 1)
  }
}
</script>
