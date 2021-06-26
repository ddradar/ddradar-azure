# Get Course Information API

日本語版は[こちら](./README-ja.md)にあります。

Get course and orders information that match the specified ID.

- [Endpoint](#endpoint)
- [Parameters](#parameters)
- [Response](#response)
  - [Response Body](#response-body)
- Links
  - [Implements (index.ts)](index.ts)
  - [Settings (function.json)](function.json)
  - [Unit Test (index.test.ts)](index.test.ts)

## Endpoint

No need Authentication.

> GET api/v1/courses/*:id*

## Parameters

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|Course ID. Should match `^[01689bdiloqDIOPQ]{32}$` pattern.|

## Response

- Returns `404 Not Found` if `id` is not defined or does not match `^[01689bdiloqDIOPQ]{32}$`.
- Returns `404 Not Found` if no course that matches `id`.
- Returns `200 OK` with [JSON body](#response-body) if found.

### Response Body

<details>
  <summary>Sample</summary>

```json
{
  "id": "qbbOOO1QibO1861bqQII9lqlPiIoqb98",
  "name": "FIRST",
  "nameKana": "C-A20-1",
  "nameIndex": -1,
  "series": "DanceDanceRevolution A20",
  "minBPM": 119,
  "maxBPM": 180,
  "charts": [
    {
      "playStyle": 1,
      "difficulty": 0,
      "level": 4,
      "notes": 401,
      "freezeArrow": 8,
      "shockArrow": 0,
      "order": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "playStyle": 1,
          "difficulty": 0,
          "level": 2
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "playStyle": 1,
          "difficulty": 0,
          "level": 3
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "playStyle": 1,
          "difficulty": 0,
          "level": 3
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "playStyle": 1,
          "difficulty": 0,
          "level": 4
        }
      ]
    },
    {
      "playStyle": 1,
      "difficulty": 1,
      "level": 8,
      "notes": 730,
      "freezeArrow": 4,
      "shockArrow": 0,
      "order": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "playStyle": 1,
          "difficulty": 1,
          "level": 4
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "playStyle": 1,
          "difficulty": 1,
          "level": 7
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "playStyle": 1,
          "difficulty": 1,
          "level": 8
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "playStyle": 1,
          "difficulty": 1,
          "level": 8
        }
      ]
    },
    {
      "playStyle": 1,
      "difficulty": 2,
      "level": 9,
      "notes": 918,
      "freezeArrow": 18,
      "shockArrow": 0,
      "order": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "playStyle": 1,
          "difficulty": 2,
          "level": 7
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "playStyle": 1,
          "difficulty": 2,
          "level": 9
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "playStyle": 1,
          "difficulty": 2,
          "level": 9
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "playStyle": 1,
          "difficulty": 2,
          "level": 9
        }
      ]
    },
    {
      "playStyle": 1,
      "difficulty": 3,
      "level": 11,
      "notes": 1091,
      "freezeArrow": 21,
      "shockArrow": 0,
      "order": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "playStyle": 1,
          "difficulty": 3,
          "level": 11
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "playStyle": 1,
          "difficulty": 3,
          "level": 11
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "playStyle": 1,
          "difficulty": 3,
          "level": 10
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "playStyle": 1,
          "difficulty": 3,
          "level": 11
        }
      ]
    },
    {
      "playStyle": 2,
      "difficulty": 1,
      "level": 9,
      "notes": 733,
      "freezeArrow": 3,
      "shockArrow": 0,
      "order": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "playStyle": 2,
          "difficulty": 1,
          "level": 4
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "playStyle": 2,
          "difficulty": 1,
          "level": 7
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "playStyle": 2,
          "difficulty": 1,
          "level": 9
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "playStyle": 2,
          "difficulty": 1,
          "level": 8
        }
      ]
    },
    {
      "playStyle": 2,
      "difficulty": 2,
      "level": 13,
      "notes": 951,
      "freezeArrow": 8,
      "shockArrow": 0,
      "order": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "playStyle": 2,
          "difficulty": 2,
          "level": 7
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "playStyle": 2,
          "difficulty": 2,
          "level": 9
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "playStyle": 2,
          "difficulty": 2,
          "level": 10
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "playStyle": 2,
          "difficulty": 2,
          "level": 13
        }
      ]
    },
    {
      "playStyle": 2,
      "difficulty": 3,
      "level": 11,
      "notes": 1176,
      "freezeArrow": 15,
      "shockArrow": 0,
      "order": [
        {
          "songId": "lIlQ8DbPP6Iil1DOlQ6d8IPQblDQ8IiI",
          "songName": "HAVE YOU NEVER BEEN MELLOW (20th Anniversary Mix)",
          "playStyle": 2,
          "difficulty": 3,
          "level": 10
        },
        {
          "songId": "b1do8OI6qDDlQO0PI16868ql6bdbI886",
          "songName": "MAKE IT BETTER",
          "playStyle": 2,
          "difficulty": 3,
          "level": 11
        },
        {
          "songId": "Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi",
          "songName": "TRIP MACHINE",
          "playStyle": 2,
          "difficulty": 3,
          "level": 10
        },
        {
          "songId": "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI",
          "songName": "PARANOiA",
          "playStyle": 2,
          "difficulty": 3,
          "level": 11
        }
      ]
    }
  ]
}
```

</details>

|Name|Type|Description|
|----|:--:|-----------|
|`id`|string|Course id that depend on official site. `^[01689bdiloqDIOPQ]{32}$`|
|`name`|string|Course name|
|`nameKana`|string|Name for sorting. `^([A-Z0-9 .ぁ-んー]*)$`|
|`nameIndex`|integer|`-1`: NONSTOP, `-2`: Grade|
|`series`|string|Series title|
|`minBPM`|integer|Displayed min BPM (Beet Per Minutes).|
|`maxBPM`|integer|Displayed max BPM (Beet Per Minutes).|
|`deleted`|boolean?|Course is deleted or not|
|`charts`|Order\[\]|Course order list by play style and difficulty. [see below](#order)|

#### Order

|Name|Type|Description|
|----|:--:|-----------|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|Course level|
|`notes`|integer|Normal arrow count. (Jump = 1 count)|
|`freezeArrow`|integer|Freeze arrow count|
|`shockArrow`|integer|Shock arrow count|
|`order`|Chart\[\]|Song and chart info in this course. [see below](#chart)|

#### Chart

|Name|Type|Description|
|----|:--:|-----------|
|`songId`|string|Song id that depend on official site. `^[01689bdiloqDIOPQ]{32}$`|
|`songName`|string|Song name|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|Chart level|
