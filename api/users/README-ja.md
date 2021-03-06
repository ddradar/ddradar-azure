# Get User List API

English version is [here](./README.md).

指定した条件と一致する、ユーザーの一覧を取得します。

- [エンドポイント](#endpoint)
- [パラメータ](#parameters)
- [応答](#response)
  - [本文](#response-body)
- リンク
  - [実装 (index.ts)](./index.ts)
  - [設定 (function.json)](./function.json)
  - [単体テスト (index.test.ts)](./index.test.ts)

## Endpoint

認証は不要です。認証済ユーザーの場合は、非公開の場合でも自身のデータを取得できます。

> GET api/v1/users?area=0&name=foo&code=10000000

## Parameters

|名前|型|説明|
|----|:--:|---|
|`area`|integer|[エリアコード](../../docs/db/users-ja.md#area)。未指定時には全てのエリアから検索します。|
|`name`|string|検索するユーザー名(部分一致)。未指定時には全てのユーザー名から検索します。|
|`code`|integer|DDR CODE (完全一致)。`10000000`以上`99999999`以下の範囲。未指定時には全てのDDR CODEから検索します。|

## Response

- パラメータのいずれかが不正な値である場合、`400 Bad Request`を返します。
- その他の場合は、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
[
  {
    "id": "afro0001",
    "name": "AFRO",
    "area": 13,
    "code": 10000000
  },
  {
    "id": "emi",
    "name": "TOSHIBA EMI",
    "area": 0
  },
]
```

</details>

[User](#user)の配列

#### User

|名前|型|説明|
|---|:--:|---|
|`id`|string|ユーザーID|
|`name`|string|ユーザー名|
|`area`|number|[エリアコード](../../docs/db/users-ja.md#area)|
|`code`|number?|DDR CODE (省略可)|
