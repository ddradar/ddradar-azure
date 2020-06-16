import type { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { isSongSchema, SongSchema } from '@ddradar/core/db/songs'

import { getContainer } from '../cosmos'

/** Add or update song and charts information. */
const httpTrigger: AzureFunction = async (
  context: Pick<Context, 'res'>,
  req: Pick<HttpRequest, 'body'>
): Promise<void> => {
  if (!isSongSchema(req.body)) {
    context.res = {
      status: 400,
      body: 'Body is not SongSchema',
    }
    return
  }

  const container = getContainer('Songs', true)
  const { resource } = await container.items.upsert<SongSchema>(req.body)
  if (!resource) throw new Error(`Failed upsert id:${req.body.id}`)
  const responseBody: SongSchema = {
    id: resource.id,
    name: resource.name,
    nameKana: resource.nameKana,
    nameIndex: resource.nameIndex,
    artist: resource.artist,
    series: resource.series,
    minBPM: resource.minBPM,
    maxBPM: resource.maxBPM,
    charts: [...resource.charts],
  }

  context.res = {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: responseBody,
  }
}

export default httpTrigger
