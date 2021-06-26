# DDRadar

English guide is [here](./README.md).

[![Staging Build Status](https://img.shields.io/github/workflow/status/ddradar/ddradar/staging?event=push&label=staging&logo=microsoft-azure)](https://beta.ddradar.app/)
[![last commit](https://img.shields.io/github/last-commit/ddradar/ddradar "last commit")](https://github.com/ddradar/ddradar/commits/master)
[![release version](https://img.shields.io/github/v/release/ddradar/ddradar?sort=semver "release version")](https://github.com/ddradar/ddradar/releases)
[![Node.js CI](https://github.com/ddradar/ddradar/actions/workflows/nodejs.yml/badge.svg)](https://github.com/ddradar/ddradar/actions/workflows/nodejs.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/ddradar/ddradar/badge "CodeFactor")](https://www.codefactor.io/repository/github/ddradar/ddradar)
[![codecov](https://codecov.io/gh/ddradar/ddradar/branch/master/graph/badge.svg?token=ynbl5vBONK "codecov")](https://codecov.io/gh/ddradar/ddradar)
[![dependabot](https://img.shields.io/static/v1?label=dependabot&message=enabled&color=green&logo=dependabot "dependabot")](https://github.com/ddradar/ddradar/network/updates)
[![License](https://img.shields.io/github/license/ddradar/ddradar)](LICENSE)

DDR Score Tracker

## Setup

```bash
# 依存関係のインストール
yarn
```

### Required

- Node.js `>=12`
- Yarn `>=1.22.4`
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools) `>=3`

- API開発やテストに[Azure Cosmos Emulator](https://docs.microsoft.com/azure/cosmos-db/local-emulator)を使う場合は、下記の環境変数を設定してください。
  - `COSMOS_DB_CONN`: `AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==`
  - `NODE_TLS_REJECT_UNAUTHORIZED`: `0`

- クライアントとAPIの統合開発を行う場合は、下記の環境変数を設定してください。
  - `API_URL`: `http://localhost:7071/api/v1`

## Develop Command

```bash
# 依存関係のインストール
yarn
# Lintツールの実行
yarn lint
# Lintツールの実行&自動修正
yarn fix
# 単体テスト
yarn test
# 本番ビルド
yarn build
```

## Contributing

[こちらのガイド](CONTRIBUTING-ja.md)をご覧ください。
