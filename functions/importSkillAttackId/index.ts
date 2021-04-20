import type { Logger } from '@azure/functions'
import type { Database } from '@ddradar/core'
import fetch from 'node-fetch'

import { masterMusicToMap } from '../skill-attack'

const masterMusicUri = 'http://skillattack.com/sa4/data/master_music.txt'

/** Import skillAttackId from Skill Attack site. */
export default async function (
  context: { log: Pick<Logger, 'error' | 'info'> },
  _: unknown,
  songs: Database.SongSchema[]
): Promise<Database.SongSchema[]> {
  if (!songs.length) return []

  const res = await fetch(masterMusicUri)
  if (!res.ok) {
    context.log.error(`${res.status}: ${res.statusText}`)
    context.log.error(await res.text())
    return []
  }

  const map = masterMusicToMap(Buffer.from(await res.arrayBuffer()))

  return songs
    .map(song => {
      const skillAttackId = map.get(song.id)
      if (skillAttackId === undefined) {
        context.log.info(`Not Found skillAttackId: ${song.name}`)
        return
      }
      song.skillAttackId = skillAttackId
      context.log.info(
        `Updated: ${song.name} { id: "${song.id}", skillAttackId: ${skillAttackId} }`
      )
      return song
    })
    .filter((s): s is Database.SongSchema => !!s)
}
