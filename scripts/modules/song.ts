export function isCourse(songId: string): boolean {
  return [
    '19id1DO6q9Pb1681db61D8D8oQi9dlb6', // SP初段(A20)
    'b9OboQl6d9PqQddIdQDobP0d8o6dOqob', // SP二段(A20)
    'P986dlQP0DO0106oq0P81Qi0QQDQ666O', // SP三段(A20)
    'o0DP6qqql9D1bDbQPOQiP8iIq81qI8O9', // SP四段(A20)
    '880I00ODqPD1OQQPOP0Pd19Qq1qiloDP', // SP五段(A20)
    'PbIq9b1I161P0iD18qQiOO9qIoodbDIP', // SP六段(A20)
    '666q06q6I01loQOq0qd98IIOObIDOd8q', // SP七段(A20)
    'l8Q1Od0d0IQOQl61l8lIlPiI80P10OQb', // SP八段(A20)
    'ol8oiPo8iod9bDPPD1qdlbPd1ddqP6oP', // SP九段(A20)
    'OPi8oobIDid6q0P18QdD11D6O1I6Ioqo', // SP十段(A20)
    'qDDlD0blPO68IQiOQ8i1qPDd8IOPIIO6', // SP皆伝(A20)
    '9IliQ1O0dOQPiObPDDDblDO6oliDodlb', // DP初段(A20)
    'IlQodD9Dbld8QiOql68bPPQbd6bll6i1', // DP二段(A20)
    'dib16I1b0o9OdOd1O90dO1Q6iIO9PQo9', // DP三段(A20)
    '8OoDQb16lP0i96qiDQqo90Q6bOP1o89D', // DP四段(A20)
    'ddql809Qo8q68918lIDOPDQ6q1liD9b6', // DP五段(A20)
    '9D69dQo1dQqPD6l9ObiI0b0i8d9ddool', // DP六段(A20)
    'Pbbidbl9l8IqddQOq0069oQ6Oi1DQdP1', // DP七段(A20)
    'idiOI1Qb9D0dQI6IOlob8QbOqdDOoObP', // DP八段(A20)
    'ID9Dqo9QQQIP9ObD0lbbi6O6PiD18oD0', // DP九段(A20)
    'bPQDblO8Do0Oo9O0PP0b8PO1PblDioDP', // DP十段(A20)
    'o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db', // DP皆伝(A20)
    '6bo6ID6l11qd6lolilI6o6q8I6ddo88i', // SP初段(A20 PLUS)
    'd0l89dI9d6Di11DQ9P8D1Pl1d0Db81D9', // SP二段(A20 PLUS)
    'b6qOqD9bOQO1O0q8000D6dIdqb80li1b', // SP三段(A20 PLUS)
    '6loIiOd8PP90dPOq16Q6PdPPO0DQDOPP', // SP四段(A20 PLUS)
    '91DOoD99iIq9oIdOi9QqDQ0qlQPQPOii', // SP五段(A20 PLUS)
    'odPd96PliIo9OIO8q8iD8Qd6QoId6o1d', // SP六段(A20 PLUS)
    'l6Pd9dQdoq1qI9iOOqdbDQI0qiQioP60', // SP七段(A20 PLUS)
    'O91QbQb0QdObIO6d8lo8lq00ibOQP9PQ', // SP八段(A20 PLUS)
    'OdOP8o0dQdo0DPiio6dI8QId869D9oqd', // SP九段(A20 PLUS)
    'o11OO8oodDODD0oolD6ql6DiODPQboOo', // SP十段(A20 PLUS)
    '6q6Oil608iDQlOD86d1qiDPo8Dd8IP16', // SP皆伝(A20 PLUS)
    'bIb6Q6DD9iP1d61dbOqdi6IQPllOb1IP', // DP初段(A20 PLUS)
    'iDiiO18PPl6iDlDlddi9ildIqO60bQdo', // DP二段(A20 PLUS)
    'Iblb8l6qPOQD8do891b1O0Pd9q60b6oD', // DP三段(A20 PLUS)
    'ilD1Qb1IqqDP1bo1i66q688q6doPq6Qb', // DP四段(A20 PLUS)
    'q0IObiQdI9o918O0DbPlldqd01liQ8Ql', // DP五段(A20 PLUS)
    'dO01ddIq0bq9019olIDoD1IIPIb9DQ9D', // DP六段(A20 PLUS)
    'b0DliOIqlP9lldO9qQo0986QIo9io96d', // DP七段(A20 PLUS)
    'oiqql6iPq8Oq0QIqlqb1DOOO8ioPo8b9', // DP八段(A20 PLUS)
    'DQqi68IP1qbDiQ9li6PI1Q9Iddd6o9QQ', // DP九段(A20 PLUS)
    '9O0b1DddI6OiOD6PQbboPbdd8Pi1iPlb', // DP十段(A20 PLUS)
    '199ODd8l0Qld9i6DdqOdb1ll66D1I1Q9', // DP皆伝(A20 PLUS)
    'qbbOOO1QibO1861bqQII9lqlPiIoqb98', // FIRST
    'I90bQ81P1blOPIdd9PPl6I9D8DQ1dIob', // TWENTY
    '88o8Oq69ldilblP10DI0qqb6b8I0DDi9', // BOUNCE
    'q6oOPqQPlOQoooq888bPI1OPDlqDIQQD', // PASSION
    'i1DqPb01I6I1dP8qoO1qiIPDlOD9D9oQ', // PLANET
    'DQilQP810dq8D9i11q6Oq0ooDdQQO0lI', // HARD DANCE
    'l1o0olodIDDiqDQ101obOD1qo81q0QOP', // ONE HALF
    'O6Pi0O800b8b6d9dd9P89dD1900I1q80', // HYPER
    'dqQD9ilqIIilOQi986Ql6dd1ldiPob88', // ☆☆☆☆
    'Plld00DiIO9bPqdq190li1iIPDdq6Qlb', // Intelligence
    'diOIbOoPIPO9DP1QiOi9QdOlqQbI8Old', // STRANGE
    'lqi1olqq0bq0O08i8qPOIlqDD68qoObP', // REMIXES
    '6oIoo19P98qPqbboqoPDlqb0qqb08oO9', // RAVE
    'l98qQo00ddOPq6PIDqqQO0DOdDbdbl9Q', // DIVA
    'PPqP0q8liql0o9ilo66bDiQl0O0dIldQ', // AGGRESSIVE
    '08io99Obq06Oq6bD6Pq999PDOOb6Oo8o', // SNOW WHITE
    'DO1OqlIdi9O0IDIQ9il1IoOqI86Id0Q0', // PARTY ANTHEMS
    'qqbIDd9DoQi1i0lod19QQDi91QoiQqll', // FANTASY
  ].includes(songId)
}

export function isDeleted(songId: string): boolean {
  return [
    '19id1DO6q9Pb1681db61D8D8oQi9dlb6', // SP初段(A20)
    'b9OboQl6d9PqQddIdQDobP0d8o6dOqob', // SP二段(A20)
    'P986dlQP0DO0106oq0P81Qi0QQDQ666O', // SP三段(A20)
    'o0DP6qqql9D1bDbQPOQiP8iIq81qI8O9', // SP四段(A20)
    '880I00ODqPD1OQQPOP0Pd19Qq1qiloDP', // SP五段(A20)
    'PbIq9b1I161P0iD18qQiOO9qIoodbDIP', // SP六段(A20)
    '666q06q6I01loQOq0qd98IIOObIDOd8q', // SP七段(A20)
    'l8Q1Od0d0IQOQl61l8lIlPiI80P10OQb', // SP八段(A20)
    'ol8oiPo8iod9bDPPD1qdlbPd1ddqP6oP', // SP九段(A20)
    'OPi8oobIDid6q0P18QdD11D6O1I6Ioqo', // SP十段(A20)
    'qDDlD0blPO68IQiOQ8i1qPDd8IOPIIO6', // SP皆伝(A20)
    '9IliQ1O0dOQPiObPDDDblDO6oliDodlb', // DP初段(A20)
    'IlQodD9Dbld8QiOql68bPPQbd6bll6i1', // DP二段(A20)
    'dib16I1b0o9OdOd1O90dO1Q6iIO9PQo9', // DP三段(A20)
    '8OoDQb16lP0i96qiDQqo90Q6bOP1o89D', // DP四段(A20)
    'ddql809Qo8q68918lIDOPDQ6q1liD9b6', // DP五段(A20)
    '9D69dQo1dQqPD6l9ObiI0b0i8d9ddool', // DP六段(A20)
    'Pbbidbl9l8IqddQOq0069oQ6Oi1DQdP1', // DP七段(A20)
    'idiOI1Qb9D0dQI6IOlob8QbOqdDOoObP', // DP八段(A20)
    'ID9Dqo9QQQIP9ObD0lbbi6O6PiD18oD0', // DP九段(A20)
    'bPQDblO8Do0Oo9O0PP0b8PO1PblDioDP', // DP十段(A20)
    'o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db', // DP皆伝(A20)
    '91qD6DbDqi96qbIO66oboliPD8IPP6io', // 輪廻転生
    'qOlDPoiqibIOqod69dPilbiqD6qdO1qQ', // More One Night
    'dOblQOoDb96l00dqPlIb9DQl86q9PboI', // 回レ！雪月花
    'od66Qb16lI019I06lllII811I9ol6l0i', // ようこそジャパリパークへ
    'PqOilI0ql6QDID6oo0Qb9iDo1doqQqPQ', // 放課後ストライド
  ].includes(songId)
}
