import type { Context } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

/** Get course and orders information that match the specified ID. */
export default async function (
  { bindingData }: Pick<Context, 'bindingData'>,
  _req: unknown,
  [course]: Database.CourseSchema[]
): Promise<ErrorResult<404> | SuccessResult<Api.CourseInfo>> {
  if (!course) {
    return new ErrorResult(404, `Not found course that id: "${bindingData.id}"`)
  }

  return new SuccessResult(course)
}
