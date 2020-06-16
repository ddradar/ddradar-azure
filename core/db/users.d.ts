import { ClearLamp } from './scores'
import { Difficulty } from './songs'

export type UserSchema = {
  /** Auto generated by Azure Authentication */
  id: string
  /** User id (used for user page URL) */
  displayedId: string
  name: string
  area: AreaCode
  /** DDR Code */
  code?: number
  /** `true` if this user info is public, otherwize `false`. */
  isPublic: boolean
  /** Total count for each `Difficulty` and `ClearLamp` */
  totalClear: {
    single: {
      [difficculty in Difficulty]: { [clearLamp in ClearLamp]: number }
    }
    double: {
      [difficculty in Difficulty]: { [clearLamp in ClearLamp]: number }
    }
  }
  /** Total score for each `Difficulty` */
  totalScore: {
    single: { [difficculty in Difficulty]: number }
    double: { [difficculty in Difficulty]: number }
  }
}

export type AreaCode =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 106
  | 107
  | 108
  | 109
  | 110
  | 111
  | 112
  | 113
  | 114
  | 115
  | 116
  | 117
  | 118