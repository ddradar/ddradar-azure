import { createLocalVue, mount } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import HelpPage from '~/pages/help/index.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('pages/help/index.vue', () => {
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    test('renders correctly', () => {
      const wrapper = mount(HelpPage, { localVue, i18n })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
