import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

/** Get a list of song information that matches the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'query'>,
  songs: Api.SongListData[]
): Promise<ErrorResult<404> | SuccessResult<Api.SongListData[]>> {
  const i = parseFloat(req.query.series ?? '')
  const isValidSeries = Number.isInteger(i) && i >= 0 && i < Song.seriesSet.size

  const body = songs.filter(
    s => !isValidSeries || s.series === [...Song.seriesSet][i]
  )

  if (body.length === 0) return new ErrorResult(404)

  return new SuccessResult(body)
}
