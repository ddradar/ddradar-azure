<template>
  <span>
    <span class="flag-icon" :class="flagIconClass" :title="title" />
    &nbsp;{{ title }}
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class FlagComponent extends Vue {
  @Prop({ type: String, required: true })
  readonly iso!: string

  @Prop({ type: String, required: true })
  readonly title!: string

  get flagIconClass() {
    return `flag-icon-${this.iso.toLowerCase()}` as const
  }
}
</script>

<style scoped lang="scss">
$flag-icon-css-path: '~flag-icon-css/flags';
$include: jp, us;
@import '~flag-icon-css/sass/flag-icon';
</style>
