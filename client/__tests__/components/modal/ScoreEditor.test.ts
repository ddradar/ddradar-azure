import { Score } from '@ddradar/core'
import { testSongData } from '@ddradar/core/__tests__/data'
import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getChartScore, postChartScore } from '~/api/score'
import ScoreEditor from '~/components/modal/ScoreEditor.vue'
import * as popup from '~/utils/popup'

jest.mock('@ddradar/core')
jest.mock('~/api/score')
jest.mock('~/utils/popup')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/modal/ScoreEditor.vue', () => {
  let wrapper: Wrapper<ScoreEditor>
  const propsData = {
    songId: testSongData.id,
    playStyle: testSongData.charts[0].playStyle,
    difficulty: testSongData.charts[0].difficulty,
    songData: testSongData,
  }
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  const $parent = { close: jest.fn() }
  beforeEach(() => {
    mocked(getChartScore).mockRejectedValue('404')
    wrapper = shallowMount(ScoreEditor, { localVue, propsData, i18n })
  })

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    test('{ selectedChart: null } renders chart dropdown', () => {
      const wrapper = mount(ScoreEditor, {
        localVue,
        propsData: { ...propsData, playStyle: null, difficulty: null },
        i18n,
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('{ selectedChart: charts[0] } renders edit fields', () => {
      const wrapper = mount(ScoreEditor, { localVue, propsData, i18n })
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Computed
  describe('get rank()', () => {
    beforeEach(() => mocked(Score.getDanceLevel).mockClear())
    test('{ isFailed: true } returns "E"', () => {
      // Arrange - Act
      wrapper.setData({ isFailed: true })
      // @ts-ignore
      const rank = wrapper.vm.rank

      // Assert
      expect(rank).toBe('E')
      expect(mocked(Score.getDanceLevel)).not.toBeCalled()
    })
    test('{ isFailed: false } returns getDanceLevel()', () => {
      // Arrange
      const score = 800000
      mocked(Score.getDanceLevel).mockClear()
      mocked(Score.getDanceLevel).mockReturnValue('A')

      // Act
      wrapper.setData({ isFailed: false, score })
      // @ts-ignore
      const rank = wrapper.vm.rank

      // Assert
      expect(rank).toBe('A')
      expect(mocked(Score.getDanceLevel)).toBeCalledWith(score)
    })
  })

  // Method
  describe('onChartSelected', () => {
    test('({ playStyle: 1, difficulty: 4 }) sets selectedChart: null', () => {
      // @ts-ignore
      wrapper.vm.onChartSelected({ playStyle: 1, difficulty: 4 })

      // @ts-ignore
      expect(wrapper.vm.selectedChart).toBeNull()
    })
    test('({ playStyle: 1, difficulty: 1 }) sets selectedChart: chart[1]', () => {
      // @ts-ignore
      wrapper.vm.onChartSelected({ playStyle: 1, difficulty: 1 })

      // @ts-ignore
      expect(wrapper.vm.selectedChart).toBe(testSongData.charts[1])
    })
  })
  describe('calcScore', () => {
    beforeEach(() => {
      mocked(Score.setValidScoreFromChart).mockReset()
      mocked(popup.warning).mockClear()
    })

    test('calls setValidScoreFromChart()', () => {
      // Arrange
      mocked(Score.setValidScoreFromChart).mockReturnValue({
        score: 0,
        exScore: 0,
        clearLamp: 0,
        maxCombo: 0,
        rank: 'D',
      })

      // Act
      // @ts-ignore
      wrapper.vm.calcScore()

      // Assert
      expect(mocked(Score.setValidScoreFromChart)).toBeCalled()
    })
    test('calls popup.warning() if setValidScoreFromChart() throws error', () => {
      // Arrange
      mocked(Score.setValidScoreFromChart).mockImplementation(() => {
        throw new Error('Invalid Score')
      })

      // Act
      // @ts-ignore
      wrapper.vm.calcScore()

      // Assert
      expect(mocked(Score.setValidScoreFromChart)).toBeCalled()
      expect(mocked(popup.warning)).toBeCalled()
    })
  })
  describe('saveScore', () => {
    beforeEach(() => {
      mocked(postChartScore).mockClear()
      mocked(popup.success).mockClear()
      mocked(popup.danger).mockClear()
      // @ts-ignore
      wrapper.vm.$parent = $parent
    })
    test('calls postChartScore() and close', async () => {
      // Arrange - Act
      // @ts-ignore
      await wrapper.vm.saveScore()

      // Assert
      expect(mocked(postChartScore)).toBeCalled()
      expect(mocked(popup.success)).toBeCalled()
      expect($parent.close).toBeCalled()
    })
    test('calls popup.danger() if postChartScore() throws error and close', async () => {
      // Arrange
      mocked(postChartScore).mockRejectedValueOnce('Error')

      // Act
      // @ts-ignore
      await wrapper.vm.saveScore()

      // Assert
      expect(mocked(postChartScore)).toBeCalled()
      expect(mocked(popup.success)).not.toBeCalled()
      expect(mocked(popup.danger)).toBeCalled()
      expect($parent.close).toBeCalled()
    })
  })
})
