import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import {
  privateUser,
  publicUser,
  testSongData,
} from '@ddradar/core/__tests__/data'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getChartScore } from '~/api/score'
import ScoreBoard from '~/components/shared/ScoreBoard.vue'

jest.mock('~/api/score')
jest.mock('@ddradar/core')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/shared/ScoreBoard.vue', () => {
  const info = { ...testSongData, charts: undefined }
  const chart = { ...testSongData.charts[0] }
  const propsData = { info, chart }
  const $accessor = { isLoggedIn: true, user: { ...privateUser } }
  const scores = [
    {
      userId: '0',
      userName: '0',
      clearLamp: 7,
      score: 1000000,
      exScore: chart.notes * 3,
      isArea: true,
    },
    {
      userId: '13',
      userName: '13',
      clearLamp: 6,
      score: 999950,
      exScore: chart.notes * 3 - 5,
      isArea: true,
    },
    {
      userId: '1user',
      userName: publicUser.name,
      clearLamp: 6,
      score: 999950,
      exScore: chart.notes * 3 - 5,
    },
    {
      userId: privateUser.id,
      userName: privateUser.name,
      clearLamp: 6,
      score: 999930,
      exScore: chart.notes * 3 - 5,
    },
  ]
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  const mocks = {
    $accessor,
    $http: {},
    $fetchState: { pending: false },
    $fetch: jest.fn(),
  }
  const options = { localVue, propsData, mocks, i18n }
  let wrapper: ReturnType<typeof shallowMount>
  beforeEach(() => {
    wrapper = shallowMount(ScoreBoard, options)
    mocked(Song.isDeletedOnGate).mockReturnValue(false)
  })

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    const stubs = { NuxtLink: RouterLinkStub, ScoreBadge: true }
    const mocks = {
      $accessor: { isLoggedIn: false },
      $fetchState: { pending: false },
    }

    test('{ loading: true } renders loading spin', async () => {
      // Arrange
      const mocks = {
        $accessor: { isLoggedIn: false },
        $fetchState: { pending: true },
      }
      const data = () => ({ scores: [] })
      const options = { localVue, propsData, mocks, stubs, i18n, data }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [...] } renders score list', async () => {
      // Arrange
      const data = () => ({ scores })
      const options = { localVue, propsData, mocks, stubs, i18n, data }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [] } renders empty', async () => {
      // Arrange
      const data = () => ({ scores: [] })
      const options = { localVue, propsData, mocks, stubs, i18n, data }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders edit button if loggedIn', async () => {
      // Arrange
      const mocks = { $accessor, $fetchState: { pending: false } }
      const options = { localVue, propsData, mocks, stubs, i18n }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('not renders import button if deleted song', async () => {
      // Arrange
      mocked(Song.isDeletedOnGate).mockReturnValueOnce(true)
      const mocks = { $accessor, $fetchState: { pending: false } }
      const options = { localVue, propsData, mocks, stubs, i18n }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('fetch()', () => {
    mocked(getChartScore).mockResolvedValue(scores as Api.ScoreInfo[])
    beforeEach(() => mocked(getChartScore).mockClear())

    test('{ fetchAllData: false } calls getChartScore(medium)', async () => {
      // Arrange - Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(getChartScore)).toBeCalledWith(
        mocks.$http,
        info.id,
        chart.playStyle,
        chart.difficulty,
        'medium'
      )
    })
    test('{ fetchAllData: true } calls getChartScore(full)', async () => {
      // Arrange - Act
      wrapper.setData({ fetchAllData: true })
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(getChartScore)).toBeCalledWith(
        mocks.$http,
        info.id,
        chart.playStyle,
        chart.difficulty,
        'full'
      )
    })
    test.each(['ja', 'en'])('sets { locale: %s } areaName', async locale => {
      // Arrange
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const mocks = { $accessor, $http: {}, $fetchState: { pending: true } }
      const options = { localVue, propsData, mocks, i18n }
      const wrapper = shallowMount(ScoreBoard, options)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(wrapper.vm.$data.scores).toMatchSnapshot()
    })
  })

  // Method
  describe('launchScoreEditor()', () => {
    const mocks = {
      $accessor,
      $buefy: { modal: { open: jest.fn(_ => ({ $on: jest.fn() })) } },
      $fetchState: { pending: false },
    }
    const options = { localVue, propsData, mocks, i18n }
    const wrapper = shallowMount(ScoreBoard, options)
    beforeEach(() => mocks.$buefy.modal.open.mockClear())

    test('calls $buefy.modal.open', () => {
      // Arrange - Act
      // @ts-ignore
      wrapper.vm.launchScoreEditor()

      // Assert
      expect(mocks.$buefy.modal.open).toBeCalled()
    })
  })
  describe('launchScoreImporter()', () => {
    const mocks = {
      $accessor,
      $buefy: { modal: { open: jest.fn(_ => ({ $on: jest.fn() })) } },
      $fetchState: { pending: false },
    }
    const options = { localVue, propsData, mocks, i18n }
    const wrapper = shallowMount(ScoreBoard, options)
    beforeEach(() => mocks.$buefy.modal.open.mockClear())

    test('calls $buefy.modal.open', () => {
      // Arrange - Act
      // @ts-ignore
      wrapper.vm.launchScoreImporter()

      // Assert
      expect(mocks.$buefy.modal.open).toBeCalled()
    })
  })
  describe('fetchAllScores()', () => {
    mocked(getChartScore).mockResolvedValue(scores as Api.ScoreInfo[])
    beforeEach(() => mocks.$fetch.mockClear())

    test('sets { fetchAllData = true } and calls $fetch()', () => {
      // Arrange - Act
      // @ts-ignore
      wrapper.vm.fetchAllScores()

      // Assert
      expect(wrapper.vm.$data.fetchAllData).toBe(true)
      expect(mocks.$fetch).toBeCalled()
    })
  })
})
