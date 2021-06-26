import { testSongData } from '@ddradar/core/__tests__/data'

import postSongInfo from '.'

describe('POST /api/v1/songs', () => {
  const validSong = { ...testSongData }

  test('returns "400 Bad Request" if body is empty', async () => {
    // Arrange
    const req = {}

    // Act
    const result = await postSongInfo(null, req)

    // Assert
    expect(result.httpResponse.status).toBe(400)
  })

  test.each([
    validSong,
    {
      ...validSong,
      charts: [...validSong.charts].sort((l, r) => l.difficulty - r.difficulty),
    },
    { ...validSong, foo: 'bar' },
    { ...validSong },
  ])('returns "200 OK" with JSON body if body is %p', async body => {
    // Arrange - Act
    const result = await postSongInfo(null, { body })

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual(validSong)
    expect(result.document).toStrictEqual(validSong)
  })

  test.each([
    {
      ...validSong,
      charts: [...validSong.charts].sort((l, r) => l.difficulty - r.difficulty),
      deleted: true,
    },
    { ...validSong, foo: 'bar', deleted: true },
    { ...validSong, deleted: true },
  ])('returns "200 OK" with JSON body if body is %p', async body => {
    // Arrange - Act
    const expected = { ...validSong, deleted: true }
    const result = await postSongInfo(null, { body })

    // Assert
    expect(result.httpResponse.status).toBe(200)
    expect(result.httpResponse.body).toStrictEqual(expected)
    expect(result.document).toStrictEqual(expected)
  })
})
