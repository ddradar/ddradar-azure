import { testCourseData } from '@ddradar/core/__tests__/data'
import type { Context } from '@nuxt/types'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { mocked } from 'ts-jest/utils'

import { getCourseInfo } from '~/api/course'
import CourseDetailPage from '~/pages/courses/_id/index.vue'

jest.mock('~/api/course')
const localVue = createLocalVue()

describe('pages/courses/_id/index.vue', () => {
  const course = { ...testCourseData }

  describe('snapshot test', () => {
    test('renders correctly', () => {
      // Arrange - Act
      const data = () => ({ course })
      const wrapper = shallowMount(CourseDetailPage, { localVue, data })

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '000000000000000000000000000000000'])(
      '/courses/%s returns false',
      id => {
        // Arrange
        const wrapper = shallowMount(CourseDetailPage, { localVue })
        const ctx = { params: { id } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['00000000000000000000000000000000', course.id])(
      '/courses/%s returns true',
      id => {
        // Arrange
        const wrapper = shallowMount(CourseDetailPage, { localVue })
        const ctx = { params: { id } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
      }
    )
  })
  describe('asyncData()', () => {
    const apiMock = mocked(getCourseInfo)
    beforeEach(() => {
      apiMock.mockClear()
      apiMock.mockResolvedValue(course)
    })
    test('calls getCourseInfo($http, params.id)', async () => {
      // Arrange
      const $http = { $get: jest.fn() }
      const wrapper = shallowMount(CourseDetailPage, { localVue })
      const ctx = { $http, params: { id: course.id } } as unknown as Context

      // Act
      const result: any = await wrapper.vm.$options.asyncData!(ctx)

      // Assert
      expect(result.course).toBe(course)
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith($http, course.id)
    })
  })
})
