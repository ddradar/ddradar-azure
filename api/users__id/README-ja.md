# Get User Information API

English version is [here](./README.md).

指定したIDと一致する、ユーザーの情報を取得します。

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

> GET api/v1/users/*:id*

## Parameters

|名前|型|説明|
|---|:--|---|
|`id`|string|ユーザーID|

## Response

- `id` が未指定の場合、`404 Not Found` を返します。
- `id` と一致するユーザーが存在しないか、非公開の場合、`404 Not Found` を返します。
- `id` と一致するユーザーが見つかった場合、`200 OK` と [JSON](#response-body)を返します。

### Response Body

<details>
  <summary>サンプル</summary>

```json
{
  "id": "afro0001",
  "name": "AFRO",
  "area": 13,
  "code": 10000000
}
```

</details>

|名前|型|説明|
|----|:--:|-----------|
|`id`|string|ユーザーID (ユーザーページのURL等に用いる)|
|`name`|string|ユーザー名|
|`area`|number|[エリアコード](../../docs/db/users-ja.md#area)|
|`code`|number?|DDR CODE (省略可)|
