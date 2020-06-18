import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'

import SongPage from '~/pages/songs/_id/_chart.vue'
import { SongInfo } from '~/types/api/song'

const localVue = createLocalVue()
localVue.use(Buefy)

const songInfo: SongInfo = {
  id: '8Il6980di8P89lil1PDIqqIbiq1QO8lQ',
  name: 'MAKE IT BETTER',
  nameKana: 'MAKE IT BETTER',
  nameIndex: 22,
  artist: 'mitsu-O!',
  series: 'DDR 1st',
  minBPM: 119,
  maxBPM: 119,
  charts: [
    {
      playStyle: 1,
      difficulty: 0,
      level: 3,
      notes: 67,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 14,
      voltage: 14,
      air: 9,
      freeze: 0,
      chaos: 0,
    },
    {
      playStyle: 1,
      difficulty: 1,
      level: 7,
      notes: 143,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 31,
      voltage: 29,
      air: 47,
      freeze: 0,
      chaos: 3,
    },
    {
      playStyle: 1,
      difficulty: 2,
      level: 9,
      notes: 188,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 41,
      voltage: 39,
      air: 27,
      freeze: 0,
      chaos: 13,
    },
    {
      playStyle: 1,
      difficulty: 3,
      level: 12,
      notes: 212,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 46,
      voltage: 39,
      air: 54,
      freeze: 0,
      chaos: 19,
    },
    {
      playStyle: 2,
      difficulty: 1,
      level: 7,
      notes: 130,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 28,
      voltage: 29,
      air: 61,
      freeze: 0,
      chaos: 1,
    },
    {
      playStyle: 2,
      difficulty: 2,
      level: 9,
      notes: 181,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 40,
      voltage: 39,
      air: 30,
      freeze: 0,
      chaos: 11,
    },
    {
      playStyle: 2,
      difficulty: 3,
      level: 11,
      notes: 220,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 48,
      voltage: 54,
      air: 27,
      freeze: 0,
      chaos: 41,
    },
  ],
}

describe('songs/:id/:chart', () => {
  let wrapper: Wrapper<SongPage>
  let vm: any

  beforeEach(() => {
    wrapper = shallowMount(SongPage, { localVue })
    vm = wrapper.vm
  })

  test('rendars correctly', () => {
    const wrapper = mount(SongPage, {
      localVue,
      data: () => {
        return {
          name: songInfo.name,
          artist: songInfo.artist,
          series: songInfo.series,
          minBPM: songInfo.minBPM,
          maxBPM: songInfo.maxBPM,
          charts: songInfo.charts,
          chartIndex: 0,
        }
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  test('initialized default', () => {
    expect(vm.charts).toHaveLength(0)
    expect(vm.chartIndex).toBe(0)
  })
})
