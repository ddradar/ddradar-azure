import type { Api } from '@ddradar/core'
import { testSongData } from '@ddradar/core/__tests__/data'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getSongInfo } from '~/api/song'
import ChartList from '~/components/pages/charts/ChartList.vue'

jest.mock('~/api/song', () => ({
  ...(jest.requireActual('~/api/song') as object),
  getSongInfo: jest.fn(),
}))
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/charts/ChartList.vue', () => {
  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    const stubs = { NuxtLink: RouterLinkStub }
    const wrapper = mount(ChartList, { localVue, stubs, i18n })
    test('{ loading: true } renders loading spin', async () => {
      // Arrange
      wrapper.setProps({ loading: true })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, charts: [...] } renders chart list', async () => {
      // Arrange
      const charts: Api.ChartInfo[] = [
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
      wrapper.setProps({ loading: false, charts })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, charts: [] } renders empty', async () => {
      // Arrange
      wrapper.setProps({ loading: false, charts: [] })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Method
  describe('scoreEditorModal()', () => {
    const mocks = { $buefy: { modal: { open: jest.fn() } }, $http: {} }
    test('calls $buefy.modal.open()', async () => {
      // Arrange
      mocked(getSongInfo).mockResolvedValue(testSongData)
      const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
      const wrapper = shallowMount(ChartList, { localVue, mocks, i18n })

      // Act
      // @ts-ignore
      await wrapper.vm.scoreEditorModal(
        testSongData.id,
        testSongData.charts[0].playStyle,
        testSongData.charts[0].difficulty
      )

      // Assert
      expect(mocked(getSongInfo)).toBeCalledWith(mocks.$http, testSongData.id)
      expect(mocks.$buefy.modal.open).toBeCalled()
    })
  })
})
