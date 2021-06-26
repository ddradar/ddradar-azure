import { isDeletedOnGate } from '../song'

describe('./song.ts', () => {
  describe('isDeletedOnGate', () => {
    test.each([
      '6b8lbl11Ii81bIiq1D9do811D986iDOq', // IF YOU WERE HERE
      'l9Di1l6I68ilPDlPlO6qO61l11P008OQ', // Mickey Mouse March(Eurobeat Version)
    ])('(%s) returns true', songId =>
      expect(isDeletedOnGate(songId)).toBe(true)
    )
    test.each([
      '',
      '99999999999999999999999999999999',
      '19id1DO6q9Pb1681db61D8D8oQi9dlb6', // SP初段(A20)
      '91qD6DbDqi96qbIO66oboliPD8IPP6io', // 輪廻転生
    ])('(%s) returns false', songId =>
      expect(isDeletedOnGate(songId)).toBe(false)
    )
  })
})
