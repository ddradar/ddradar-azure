export type {
  Difficulty,
  DifficultyName,
  GrooveRadar,
  NameIndex,
  PlayStyle,
  Series,
} from './db'
export {
  /* istanbul ignore next */
  difficultyMap,
  /* istanbul ignore next */
  isValidId,
  /* istanbul ignore next */
  nameIndexMap,
  /* istanbul ignore next */
  playStyleMap,
  /* istanbul ignore next */
  seriesSet,
} from './db'

/**
 * Returns whether the song has been deleted on the e-amusement GATE site.
 * @param songId Song Id
 * @returns true if deleted at DDR A version.
 */
export function isDeletedOnGate(songId: string): boolean {
  return [
    '1IbDP96O99Ob10PoPdP98IDqibqo9lqI', // KUNG FU FIGHTING
    'qoIDP9I968q8do0d6d6lQDIi8biPIoi1', // BAD GIRLS
    '9Do1l69IiP98IO91bd86oIIoQqQI9QPb', // Boom Boom Dollar (Red Monster Mix)
    'O6DPoIoQibQO1iD6I0DDDbbddDOi9QDq', // stomp to my beat
    '19l9bOoI8Dib69D0DodDo1d8i8IDb88q', // ポリリズム
    '1bD9Pi1bdPdOO111iPlbQl0iI6qdoPIo', // Trickster
    '6b8lbl11Ii81bIiq1D9do811D986iDOq', // IF YOU WERE HERE
    '81II88dobiP6Q1iq6dDOPqPQQ1dO0Qq9', // IF YOU WERE HERE (L.E.D.-G STYLE REMIX)
    'oqQIlDl811qQI01O8dDdl699OI9IbIlO', // 女々しくて
    '8d6DoOIdD61DOIQI1I0869qO99iii68Q', // future gazer
    'Q6Do1o1bP60Q1O00Dbbqd96Oq9dQd6i6', // LOVE & JOY
    '6i86dIDQQ8DQ60Piq1bqO0i08qI0ibPI', // STRAIGHT JET
    'PPDQloDPD9l1dOd6DOi8Oq8IIob9IPO1', // 折れないハート
    'odObQ86Qd1qOD9oiP6OdObdP8lqiiD8b', // ジョジョ～その血の運命～
    'l88PDoOI6b1o1ddI9bDDPil6QdDbPobI', // ふりそでーしょん
    'b1b966I1PQ6Qo6bdI6i9i1D1bqdd188i', // Burst The Gravity
    'O06bdqiPIb6i1OdqoQo0qQ0DoO1Od08O', // Choo Choo TRAIN
    '6qOIDDb9libIDlQI80l88P0io68Qq0O8', // LOVE & JOY -Risk Junk MIX-
    'l9Di1l6I68ilPDlPlO6qO61l11P008OQ', // Mickey Mouse March(Eurobeat Version)
    'qPPbDIqol6d06iD6dIdid6QQ9oPq9IDo', // Strobe♡Girl
  ].includes(songId)
}
