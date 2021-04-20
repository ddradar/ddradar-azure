import type { CourseChartSchema, CourseSchema } from '../db/songs'

/**
 * Object type returned by `/api/v1/courses/:id`
 * @see https://github.com/ddradar/ddradar/blob/master/api/courses__id/
 */
export type CourseInfo = CourseSchema

/**
 * Object type returned by `/api/v1/courses`
 * @see https://github.com/ddradar/ddradar/blob/master/api/courses/
 */
export type CourseListData = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  charts: ReadonlyArray<
    Pick<CourseChartSchema, 'playStyle' | 'difficulty' | 'level'>
  >
}
