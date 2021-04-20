import type { Api } from '@ddradar/core'

type SuccessResult = {
  status: 200
  body: Api.SongInfo[]
}

/** Get songs and charts information*/
export default async function (
  _context: unknown,
  _req: unknown,
  body: Api.SongInfo[]
): Promise<SuccessResult> {
  return { status: 200, body }
}
