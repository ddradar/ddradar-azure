import { createLocalVue, mount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import TopMessage from '~/components/pages/TopMessage.vue'
import { unixTimeToString } from '~/utils/date'

jest.mock('~/utils/date')
mocked(unixTimeToString).mockImplementation(unixTime =>
  new Date(unixTime).toUTCString()
)

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/components/pages/TopMessage.vue', () => {
  /** 2020/8/13 0:00 (Local Time zone) */
  const time = Math.floor(new Date(2020, 7, 13).valueOf() / 1000)
  const propsData = {
    type: 'is-info',
    title: 'Title',
    body: 'Message Body',
    time,
  } as const

  describe('snapshot test', () => {
    test('renders default icon if not set', () => {
      // Arrange
      const wrapper = mount(TopMessage, {
        localVue,
        propsData: { ...propsData },
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders specified icon', () => {
      // Arrange
      const wrapper = mount(TopMessage, {
        localVue,
        propsData: { ...propsData, icon: 'account' },
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
