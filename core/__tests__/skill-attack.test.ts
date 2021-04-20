import { readTextAsync, scoreTexttoScoreList } from '../skill-attack'

describe('./skill-attack.ts', () => {
  describe('readTextAsync', () => {
    test('(null) throws error', async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- error test
      await expect(readTextAsync(null!)).rejects.toThrowError()
    })
    test.each([
      [[0x74, 0x65, 0x73, 0x74], 'test'],
      [[0x83, 0x65, 0x83, 0x58, 0x83, 0x67], 'テスト'],
      [[0x95, 0x88, 0x96, 0xca], '譜面'],
    ])('(%p) returns "%s"', async (byte, expected) => {
      // Arrange
      const file = new File([Buffer.from(byte)], 'test.txt')

      // Act - Assert
      await expect(readTextAsync(file)).resolves.toBe(expected)
    })
  })
  describe('scoreTexttoScoreList', () => {
    test.each(['', '700\t0\t1\t10000000\t1604000000\t998430\t1'])(
      '("%s") returns {}',
      text => {
        expect(scoreTexttoScoreList(text)).toStrictEqual({})
      }
    )
    test('(validText) returns ScoreList', () => {
      expect(scoreTexttoScoreList(validText)).toStrictEqual({
        '700': [
          {
            songName: 'New Century',
            playStyle: 1,
            difficulty: 0,
            clearLamp: 7,
            score: 1000000,
            rank: 'AAA',
          },
          {
            songName: 'New Century',
            playStyle: 1,
            difficulty: 1,
            clearLamp: 6,
            score: 999910,
            rank: 'AAA',
          },
          {
            songName: 'New Century',
            playStyle: 1,
            difficulty: 2,
            clearLamp: 4,
            score: 989710,
            rank: 'AA+',
          },
          {
            songName: 'New Century',
            playStyle: 1,
            difficulty: 3,
            clearLamp: 2,
            score: 906550,
            rank: 'AA',
          },
          {
            songName: 'New Century',
            playStyle: 1,
            difficulty: 4,
            clearLamp: 2,
            score: 823800,
            rank: 'A',
          },
        ],
        '455': [
          {
            songName: 'TWINKLE♡HEART',
            playStyle: 2,
            difficulty: 1,
            clearLamp: 6,
            score: 999970,
            rank: 'AAA',
          },
        ],
        '753': [
          {
            songName: 'エキサイティング！！も・ちゃ・ちゃ☆',
            playStyle: 1,
            difficulty: 0,
            clearLamp: 7,
            score: 1000000,
            rank: 'AAA',
          },
        ],
      })
    })
  })
})

const validText = `
700	0	0	10000000	1604000000	1000000	3	New Century\t
700	0	1	10000000	1604000000	999910	2	New Century\t
700	0	2	10000000	1604000000	989710	1	New Century\t
700	0	3	10000000	1604000000	300620	0	New Century\t
455	1	1	10000000	1604000000	999970	2	TWINKLE&#9825;HEART\t
700	0	3	10000000	1704000000	906550	0	New Century\t
700	0	4	10000000	1704000000	823800	0	New Century\t
753	0	0	11173996	1704000000	1000000	3	エキサイティング！！も・ちゃ・ちゃ☆\t
`
