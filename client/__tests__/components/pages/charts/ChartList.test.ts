import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import type { ChartInfo } from '~/api/song'
import ChartListComponent from '~/components/pages/charts/ChartList.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/charts/ChartList.vue', () => {
  describe('snapshot test', () => {
    test('renders loading spin if { loading: true }', () => {
      // Arrange
      const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
      const wrapper = mount(ChartListComponent, {
        localVue,
        stubs: { NuxtLink: RouterLinkStub },
        propsData: { loading: true },
        i18n,
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['ja', 'en'])(
      'renders chart list if loaded charts and { locale: %s }',
      locale => {
        // Arrange
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const charts: ChartInfo[] = [
          {
            id: '9i0q91lPPiO61b9P891O1i86iOP1I08O',
            name: 'EGOISM 440',
            series: 'DanceDanceRevolution (2014)',
            playStyle: 1,
            difficulty: 4,
            level: 19,
          },
          {
            id: 'PO9Pl1q896bDDl89qQb98D80DQoPio1I',
            name: 'ENDYMION',
            series: 'DanceDanceRevolution A',
            playStyle: 1,
            difficulty: 4,
            level: 19,
          },
          {
            id: '1Dl19idl0i0qiqidbDIIbQddiP6o11PP',
            name: 'MAX 360',
            series: 'DanceDanceRevolution A',
            playStyle: 1,
            difficulty: 4,
            level: 19,
          },
          {
            id: '6bid6d9qPQ80DOqiidQQ891o6Od8801l',
            name: 'Over The “Period”',
            series: 'DanceDanceRevolution (2014)',
            playStyle: 1,
            difficulty: 4,
            level: 19,
          },
          {
            id: '606b9d6OiliId69bO9Odi6qq8o8Qd0dq',
            name: 'PARANOiA Revolution',
            series: 'DDR X3 VS 2ndMIX',
            playStyle: 1,
            difficulty: 4,
            level: 19,
          },
          {
            id: '186dd6DQq891Ib9Ilq8Qbo8lIqb0Qoll',
            name: 'Valkyrie dimension',
            series: 'DDR X2',
            playStyle: 1,
            difficulty: 4,
            level: 19,
          },
        ]
        const wrapper = mount(ChartListComponent, {
          localVue,
          stubs: { NuxtLink: RouterLinkStub },
          propsData: { charts },
          i18n,
        })

        // Act - Assert
        expect(wrapper).toMatchSnapshot()
      }
    )
    test.each(['ja', 'en'])(
      'renders empty if courses is empty and { locale: %s }',
      locale => {
        // Arrange
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = mount(ChartListComponent, {
          localVue,
          stubs: { NuxtLink: RouterLinkStub },
          i18n,
        })

        // Act - Assert
        expect(wrapper).toMatchSnapshot()
      }
    )
  })
})