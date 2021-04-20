import { scoreTexttoScoreList } from '@ddradar/core'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
  Wrapper,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { postSongScores } from '~/api/score'
import ImportPage from '~/pages/import.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/score')
jest.mock('~/utils/popup')
jest.mock('@ddradar/core')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('pages/import.vue', () => {
  let wrapper: Wrapper<ImportPage>
  const $accessor = { user: { code: 10000000 } }
  const $http = {}
  const $buefy = {}
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  const stubs = { NuxtLink: RouterLinkStub }
  beforeEach(() => {
    const mocks = { $accessor, $http, $buefy }
    wrapper = shallowMount(ImportPage, { localVue, mocks, i18n, stubs })
  })

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    test('renders correctly', () => {
      const data = () => ({ sourceCode: '<html></html>' })
      const mocks = { $accessor }
      const wrapper = mount(ImportPage, { localVue, data, mocks, i18n, stubs })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders uploading state', () => {
      const wrapper = mount(ImportPage, {
        localVue,
        data: () => ({
          file: {},
          loading: true,
          maxCount: 20,
          doneCount: 7,
          currentSong: 'PARANOiA',
        }),
        mocks: { $accessor },
        i18n,
        stubs,
      })
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Computed
  describe('get bookmarklet()', () => {
    test.each([
      ['en', /.+\/eagate\.en\.min\.js/],
      ['ja', /.+\/eagate\.ja\.min\.js/],
    ])('{ locale: %s } returns %s script', (locale, expected) => {
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const mocks = { $accessor }
      const wrapper = shallowMount(ImportPage, { localVue, mocks, i18n, stubs })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.bookmarklet).toMatch(expected)
    })
  })

  // Method
  describe('copyToClipboard()', () => {
    Object.assign(navigator, { clipboard: { writeText: () => {} } })
    jest.spyOn(navigator.clipboard, 'writeText')
    test('copies bookmarklet text to clipboard', async () => {
      const mocks = { $accessor }
      const wrapper = shallowMount(ImportPage, { localVue, mocks, i18n, stubs })

      // @ts-ignore
      const expected = wrapper.vm.bookmarklet
      // @ts-ignore
      await wrapper.vm.copyToClipboard()

      expect(navigator.clipboard.writeText).toBeCalledWith(expected)
      expect(mocked(popup.success)).toBeCalled()
    })
  })
  describe('importSkillAttackScores()', () => {
    const scoreData = [
      {
        songName: '朧',
        playStyle: 1,
        difficulty: 0,
        score: 876000,
        clearLamp: 2,
        rank: 'A+',
      } as const,
      {
        songName: '朧',
        playStyle: 1,
        difficulty: 2,
        score: 823000,
        clearLamp: 2,
        rank: 'A',
      } as const,
      {
        songName: '朧',
        playStyle: 1,
        difficulty: 3,
        score: 798000,
        clearLamp: 2,
        rank: 'A-',
      } as const,
      {
        songName: '朧',
        playStyle: 1,
        difficulty: 4,
        score: 780000,
        clearLamp: 2,
        rank: 'B+',
      } as const,
    ]
    const scoreList: ReturnType<typeof scoreTexttoScoreList> = {
      '691': scoreData,
    }
    const postMock = mocked(postSongScores)
    beforeEach(() => {
      postMock.mockClear()
      mocked(scoreTexttoScoreList).mockClear()
      mocked(popup.success).mockClear()
      mocked(popup.warning).mockClear()
      mocked(popup.danger).mockClear()
    })

    test('calls "Post Song Scores" API', async () => {
      // Arrange
      wrapper.setData({ file: {} })
      await wrapper.vm.$nextTick()
      mocked(scoreTexttoScoreList).mockReturnValue(scoreList)

      // Act
      // @ts-ignore
      await wrapper.vm.importSkillAttackScores()

      // Assert
      expect(postMock).toBeCalledWith($http, '691', scoreList['691'])
      expect(mocked(popup.success)).toBeCalled()
    })
    test('does not call scoreTexttoScoreList() if file is empty', async () => {
      // Arrange
      wrapper.setData({ file: null })
      await wrapper.vm.$nextTick()
      mocked(scoreTexttoScoreList).mockReturnValue({ foo: [] })

      // Act
      // @ts-ignore
      await wrapper.vm.importSkillAttackScores()

      // Assert
      expect(mocked(scoreTexttoScoreList)).not.toBeCalled()
      expect(postMock).not.toBeCalled()
    })
    test('does not call "Post Song Scores" API if scores is empty', async () => {
      // Arrange
      wrapper.setData({ file: {} })
      await wrapper.vm.$nextTick()
      mocked(scoreTexttoScoreList).mockReturnValue({ foo: [] })

      // Act
      // @ts-ignore
      await wrapper.vm.importSkillAttackScores()

      // Assert
      expect(mocked(scoreTexttoScoreList)).toBeCalled()
      expect(mocked(popup.success)).toBeCalled()
      expect(postMock).not.toBeCalled()
    })
    test.each([
      ['ja', 'ファイルが読み取れないか、正しい形式ではありません'],
      ['en', 'Cannot read file or invalid file'],
    ])(
      '{ locale: "%s" } warns "%s" if sourceCode is invalid',
      async (locale, message) => {
        // Arrange
        mocked(scoreTexttoScoreList).mockImplementation(() => {
          throw new Error('invalid')
        })
        const wrapper = shallowMount(ImportPage, {
          localVue,
          mocks: { $accessor, $http, $buefy },
          i18n: new VueI18n({ locale, silentFallbackWarn: true }),
          data: () => ({ file: {} }),
          stubs,
        })

        // Act
        // @ts-ignore
        await wrapper.vm.importSkillAttackScores()

        // Assert
        expect(mocked(popup.warning)).toBeCalledWith($buefy, message)
      }
    )
    test('calls popup.danger() if "Post Song Scores" API throws error', async () => {
      // Arrange
      wrapper.setData({ file: {} })
      await wrapper.vm.$nextTick()
      mocked(scoreTexttoScoreList).mockReturnValue(scoreList)
      postMock.mockRejectedValue('Error')

      // Act
      // @ts-ignore
      await wrapper.vm.importSkillAttackScores()

      // Assert
      expect(postMock).toBeCalledWith($http, '691', scoreList['691'])
      expect(mocked(popup.success)).not.toBeCalled()
      expect(mocked(popup.danger)).toBeCalledWith($buefy, 'Error')
    })
  })
})
