<template>
  <b-tooltip :label="clearStatus">
    <span
      class="tag is-light"
      :class="{
        'is-white': lamp === 7,
        'is-basic': lamp === 6,
        'is-expert': lamp === 5,
        'is-beginner': lamp === 4,
        'is-difficult': lamp === 3,
        'is-challenge': lamp === 1,
        'is-light': lamp === 0,
      }"
    >
      {{ score }}
    </span>
  </b-tooltip>
</template>

<script lang="ts">
import { Score } from '@ddradar/core'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class ScoreBadgeComponent extends Vue {
  @Prop({ required: true, type: Number })
  readonly lamp!: Score.ClearLamp

  @Prop({ required: true, type: Number })
  readonly score!: number

  get clearStatus() {
    return Score.clearLampMap.get(this.lamp)
  }
}
</script>
