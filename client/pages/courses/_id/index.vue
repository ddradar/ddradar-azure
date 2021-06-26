<template>
  <section v-if="course" class="section">
    <h1 class="title">{{ course.name }}</h1>
    <h2 class="subtitle">{{ course.series }}</h2>
    <h2 class="subtitle">BPM {{ displayedBPM }}</h2>

    <div class="content columns is-multiline">
      <order-detail
        v-for="(chart, i) in singleCharts"
        :key="i"
        :course="course"
        :chart="chart"
        class="
          column
          is-half-tablet is-one-third-desktop is-one-quarter-widescreen
        "
      />
    </div>
    <div class="content columns is-multiline">
      <order-detail
        v-for="(chart, i) in doubleCharts"
        :key="i"
        :course="course"
        :chart="chart"
        class="
          column
          is-half-tablet is-one-third-desktop is-one-quarter-widescreen
        "
      />
    </div>
  </section>
</template>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { getCourseInfo } from '~/api/course'
import { getDisplayedBPM } from '~/api/song'
import OrderDetail from '~/components/pages/courses/OrderDetail.vue'

@Component({ components: { OrderDetail } })
export default class CourseDetailPage extends Vue {
  course: Api.CourseInfo | null = null

  get singleCharts() {
    return this.course?.charts.filter(c => c.playStyle === 1) ?? []
  }

  get doubleCharts() {
    return this.course?.charts.filter(c => c.playStyle === 2) ?? []
  }

  get displayedBPM() {
    return this.course
      ? getDisplayedBPM(this.course)
      : /* istanbul ignore next */ '???'
  }

  validate({ params }: Pick<Context, 'params'>) {
    return Song.isValidId(params.id)
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return { title: this.course?.name }
  }

  async asyncData({ params, $http }: Pick<Context, 'params' | '$http'>) {
    // Get course info from API
    const course = await getCourseInfo($http, params.id)
    return { course }
  }
}
</script>
