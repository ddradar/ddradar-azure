<template>
  <section>
    <b-message
      :type="type"
      :title="title"
      has-icon
      :icon="icon"
      aria-close-label="Close message"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="content" v-html="markedContent" />
      <div class="content is-italic has-text-weight-light has-text-right">
        {{ date }}
      </div>
    </b-message>
  </section>
</template>

<script lang="ts">
import marked from 'marked'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { unixTimeToString } from '~/utils/date'

@Component
export default class TopMessageComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly type!: string

  @Prop({ required: false, type: String, default: null })
  readonly icon!: string | null

  @Prop({ required: true, type: String })
  readonly title!: string

  @Prop({ required: true, type: String })
  readonly body!: string

  @Prop({ required: true, type: Number })
  readonly time!: number

  get date() {
    return unixTimeToString(this.time)
  }

  get markedContent() {
    return marked(this.body)
  }
}
</script>

<style scoped>
section {
  padding: 0.75rem 0.75rem 0 0.75rem;
}
</style>
