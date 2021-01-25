import type { ClearStatus } from '@ddradar/core/api/user'
import { ClearLamp } from '@ddradar/core/db/scores'
import { mount } from '@vue/test-utils'

import Component from '~/components/pages/users/ClearStatus.vue'

describe('/components/pages/users/ClearStatus.vue', () => {
  describe('snapshot test', () => {
    test('renders correctly', async () => {
      // Arrange
      const title = 'LEVEL 10'
      const statuses: Pick<ClearStatus, 'clearLamp' | 'count'>[] = [
        ...Array(9).keys(),
      ].map(i => ({
        clearLamp: (i - 1) as ClearLamp | -1,
        count: 100 - i * 10,
      }))

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
