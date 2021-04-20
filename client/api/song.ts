import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

export function shortenSeriesName(series: string) {
  return series.replace(/^(DDR |DanceDanceRevolution )\(?([^)]+)\)?$/, '$2')
}

export function getChartTitle({
  playStyle,
  difficulty,
  level,
}: Pick<Api.ChartInfo, 'playStyle' | 'difficulty' | 'level'>) {
  const shortPlayStyle = `${Song.playStyleMap.get(playStyle)![0]}P` as
    | 'SP'
    | 'DP'
  const difficultyName = Song.difficultyMap.get(difficulty)!
  return `${shortPlayStyle}-${difficultyName} (${level})`
}

export function getDisplayedBPM({
  minBPM,
  maxBPM,
}: Pick<Api.SongInfo, 'minBPM' | 'maxBPM'>) {
  if (!minBPM || !maxBPM) return '???'
  if (minBPM === maxBPM) return `${minBPM}`
  return `${minBPM}-${maxBPM}`
}

/**
 * Call "Get Song Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs__id/
 */
export function getSongInfo($http: Pick<NuxtHTTPInstance, '$get'>, id: string) {
  return $http.$get<Api.SongInfo>(`${apiPrefix}/songs/${id}`)
}

/**
 * Call "Search Song by Name" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs__name__id/
 */
export function searchSongByName(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  nameIndex: number
) {
  return $http.$get<Api.SongListData[]>(`${apiPrefix}/songs/name/${nameIndex}`)
}

/**
 * Call "Search Song by Series" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs__series__id/
 */
export function searchSongBySeries(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  series: number
) {
  return $http.$get<Api.SongListData[]>(`${apiPrefix}/songs/series/${series}`)
}

/**
 * Call "Search Charts" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/charts__style__level/
 */
export function searchCharts(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  playStyle: Song.PlayStyle,
  level: number
) {
  return $http.$get<Api.ChartInfo[]>(
    `${apiPrefix}/charts/${playStyle}/${level}`
  )
}

/**
 * Call "Post Song Information" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs--post/
 */
export function postSongInfo(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: Api.SongInfo
) {
  return $http.$post<Api.SongInfo>(`${apiPrefix}/songs`, body)
}
