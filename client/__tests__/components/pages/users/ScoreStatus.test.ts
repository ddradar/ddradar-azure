import type { Api } from '@ddradar/core'
import { Score } from '@ddradar/core'
import { mount } from '@vue/test-utils'

import Component from '~/components/pages/users/ScoreStatus.vue'

describe('/components/pages/users/ScoreStatus.vue', () => {
  describe('snapshot test', () => {
    test('renders correctly', async () => {
      // Arrange
      const title = 'LEVEL 10'
      const statuses: Pick<Api.ScoreStatus, 'rank' | 'count'>[] = [
        ...Score.danceLevelSet,
        '-' as const,
      ].map((rank, i) => ({ rank, count: i * 10 }))

      // Act
      const wrapper = mount(Component, { propsData: { title, statuses } })
      await wrapper.vm.$nextTick()

      // Assert
      const canvas = wrapper.element.getElementsByTagName('canvas')[0]
      const ctx = canvas.getContext('2d')
      expect(ctx).toMatchSnapshot()
    })
    test('renders empty', async () => {
      // Arrange - Act
      const wrapper = mount(Component)
      await wrapper.vm.$nextTick()

      // Assert
      const canvas = wrapper.element.getElementsByTagName('canvas')[0]
      const ctx = canvas.getContext('2d')
      expect(ctx).toMatchSnapshot()
    })
  })
})
