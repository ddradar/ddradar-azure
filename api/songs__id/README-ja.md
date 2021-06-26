# Get Song Information API

English version is [here](./README.md).

指定したIDと一致する、曲と譜面の情報を取得します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](./index.ts)
  - [設定 (function.json)](./function.json)
  - [単体テスト (index.test.ts)](./index.test.ts)

## Endpoint

認証は不要です。

> GET api/v1/songs/*:id*

## Parameters

|名前|型|説明|
|---|:--|---|
|`id`|string|曲ID。パターン `^[01689bdiloqDIOPQ]{32}$` と一致する必要があります。|

## Response

- `id` が未指定、もしくはパターン `^[01689bdiloqDIOPQ]{32}$` と一致しない場合、`404 Not Found` を返します。
- `id` と一致する曲がない場合、`404 Not Found` を返します。
- `id` と一致する曲が見つかった場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
{
  "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
  "name": "イーディーエム・ジャンパーズ",
  "nameKana": "いーでぃーえむ じゃんぱーず",
  "nameIndex": 0,
  "artist": "かめりあ feat. ななひら",
  "series": "DanceDanceRevolution A",
  "minBPM": 72,
  "maxBPM": 145,
  "charts": [
    {
      "playStyle": 1,
      "difficulty": 0,
      "level": 3,
      "notes": 70,
      "freezeArrow": 11,
      "shockArrow": 0,
      "stream": 12,
      "voltage": 11,
      "air": 1,
      "freeze": 20,
      "chaos": 0
    },
    {
      "playStyle": 1,
      "difficulty": 1,
      "level": 5,
      "notes": 142,
      "freezeArrow": 24,
      "shockArrow": 0,
      "stream": 25,
      "voltage": 22,
      "air": 18,
      "freeze": 61,
      "chaos": 0
    },
    {
      "playStyle": 1,
      "difficulty": 2,
      "level": 8,
      "notes": 248,
      "freezeArrow": 25,
      "shockArrow": 0,
      "stream": 43,
      "voltage": 44,
      "air": 23,
      "freeze": 50,
      "chaos": 9
    },
    {
      "playStyle": 1,
      "difficulty": 3,
      "level": 12,
      "notes": 336,
      "freezeArrow": 47,
      "shockArrow": 0,
      "stream": 59,
      "voltage": 50,
      "air": 23,
      "freeze": 67,
      "chaos": 44
    },
    {
      "playStyle": 2,
      "difficulty": 1,
      "level": 4,
      "notes": 132,
      "freezeArrow": 23,
      "shockArrow": 0,
      "stream": 23,
      "voltage": 22,
      "air": 12,
      "freeze": 58,
      "chaos": 0
    },
    {
      "playStyle": 2,
      "difficulty": 2,
      "level": 8,
      "notes": 231,
      "freezeArrow": 22,
      "shockArrow": 0,
      "stream": 42,
      "voltage": 39,
      "air": 21,
      "freeze": 46,
      "chaos": 6
    },
    {
      "playStyle": 2,
      "difficulty": 3,
      "level": 11,
      "notes": 326,
      "freezeArrow": 45,
      "shockArrow": 0,
      "stream": 57,
      "voltage": 50,
      "air": 20,
      "freeze": 64,
      "chaos": 40
    }
  ]
}
```

</details>

|名前|型|説明|
|---|:--:|---|
|`id`|string|曲ID (公式サイトより) `^[01689bdiloqDIOPQ]{32}$`|
|`name`|string|曲名|
|`nameKana`|string|曲名のふりがな (並び替え用) `^([A-Z0-9 .ぁ-んー]*)$`|
|`nameIndex`|integer|曲名のインデックス。「曲名から探す」フォルダーと対応しています。<br />`0`: あ行, `1`: か行, ..., `9`: わ行, `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号|
|`artist`|string|アーティスト名|
|`series`|string|シリーズタイトル|
|`minBPM`|integer \| null|表記された最小のBPM。「???」のように明らかにされていない場合は `null`。|
|`maxBPM`|integer \| null|表記された最大のBPM。「???」のように明らかにされていない場合は `null`。|
|`deleted`|boolean?|曲が削除済みか否か|
|`charts`|StepChart\[\]|曲の譜面一覧。 [下記参照](#stepchart)|

#### StepChart

|名前|型|説明|
|---|:--:|---|
|`playStyle`|integer|`1`: SINGLE, `2`: DOUBLE|
|`difficulty`|integer|`0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE|
|`level`|integer|譜面のレベル|
|`notes`|integer|通常ノーツ数 (同時踏みは 1 カウント)|
|`freezeArrow`|integer|フリーズアロー数|
|`shockArrow`|integer|ショックアロー数|
|`stream`|integer|グルーヴレーダー値 STREAM|
|`voltage`|integer|グルーヴレーダー値 VOLTAGE|
|`air`|integer|グルーヴレーダー値 AIR|
|`freeze`|integer|グルーヴレーダー値 FREEZE|
|`chaos`|integer|グルーヴレーダー値 CHAOS|
