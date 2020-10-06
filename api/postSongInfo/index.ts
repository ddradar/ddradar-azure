import type { HttpRequest } from '@azure/functions'

import { isSongSchema, SongSchema } from '../db/songs'
import { ErrorResult, SuccessResult } from '../function'

type PostSongResult = {
  httpResponse: ErrorResult<400> | SuccessResult<SongSchema>
  document?: SongSchema
}

/** Add or update song and charts information. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'body'>
): Promise<PostSongResult> {
  if (!isSongSchema(req.body)) {
    return { httpResponse: new ErrorResult(400) }
  }

  const document: SongSchema = {
    id: req.body.id,
    name: req.body.name,
    nameKana: req.body.nameKana,
    nameIndex: req.body.nameIndex,
    artist: req.body.artist,
    series: req.body.series,
    minBPM: req.body.minBPM,
    maxBPM: req.body.maxBPM,
    charts: req.body.charts.sort((l, r) =>
      l.playStyle === r.playStyle
        ? l.difficulty - r.difficulty
        : l.playStyle - r.playStyle
    ),
  }

  return { httpResponse: new SuccessResult(document), document }
}
