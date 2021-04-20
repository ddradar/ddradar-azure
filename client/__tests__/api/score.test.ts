import type { Api } from '@ddradar/core'

import {
  deleteChartScore,
  getChartScore,
  postChartScore,
  postSongScores,
} from '~/api/score'

describe('./api/score.ts', () => {
  const songId = '00000000000000000000000000000000'

  describe('getChartScore', () => {
    const $http = { $get: jest.fn<Promise<any>, [string]>() }
    const scores: Api.ScoreInfo[] = []
    $http.$get.mockResolvedValue(scores)
    test.each([
      [1, 0, undefined, `/api/v1/scores/${songId}/1/0`] as const,
      [1, 3, 'private', `/api/v1/scores/${songId}/1/3?scope=private`] as const,
      [1, 4, 'medium', `/api/v1/scores/${songId}/1/4?scope=medium`] as const,
      [2, 1, 'full', `/api/v1/scores/${songId}/2/1?scope=full`] as const,
    ])(
      `($http, "${songId}", %i, %i, %p) calls GET "%s"`,
      async (playStyle, difficulty, scope, uri) => {
        // Arrange
        $http.$get.mockClear()

        // Act
        const result = await getChartScore(
          $http,
          songId,
          playStyle,
          difficulty,
          scope
        )

        // Assert
        expect(result).toBe(scores)
        expect($http.$get).toBeCalledWith(uri)
      }
    )
  })

  describe('postChartScore', () => {
    test(`($http, "${songId}", 1, 0, score) calls POST "/api/v1/scores/${songId}/1/0"`, async () => {
      // Arrange
      const $http = { $post: jest.fn<Promise<any>, [string, any]>() }
      const score: Api.ScoreBody = { clearLamp: 6, rank: 'AAA', score: 999800 }

      // Act
      await postChartScore($http, songId, 1, 0, score)

      // Assert
      expect($http.$post).toBeCalledWith(`/api/v1/scores/${songId}/1/0`, score)
    })
  })

  describe('deleteChartScore', () => {
    test(`($http, "${songId}", 2, 1) calls DELETE "/api/v1/scores/${songId}/2/1"`, async () => {
      // Arrange
      const $http = { delete: jest.fn<any, [string]>() }

      // Act
      await deleteChartScore($http, songId, 2, 1)

      // Assert
      expect($http.delete).toBeCalledWith(`/api/v1/scores/${songId}/2/1`)
    })
  })

  describe('postSongScores', () => {
    test(`($http, "${songId}", scores) calls POST "/api/v1/scores/${songId}"`, async () => {
      // Arrange
      const $http = { $post: jest.fn<Promise<any>, [string, any]>() }
      const scores: Api.ScoreListBody[] = [
        {
          playStyle: 1,
          difficulty: 0,
          clearLamp: 6,
          rank: 'AAA',
          score: 999800,
        },
      ]

      // Act
      await postSongScores($http, songId, scores)

      // Assert
      expect($http.$post).toBeCalledTimes(1)
      expect($http.$post).toBeCalledWith(`/api/v1/scores/${songId}`, scores)
    })
  })
})
