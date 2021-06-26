# DDRadar

日本語版のガイドは[こちら](README-ja.md)です。

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
# Install dependencies
yarn
```

### Required

- Node.js `>=12`
- Yarn `>=1.22.4`
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools) `>=3`

- If you want to use [Azure Cosmos Emulator](https://docs.microsoft.com/azure/cosmos-db/local-emulator) for API development and test, install it and set env below.
  - `COSMOS_DB_CONN`: `AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==`
  - `NODE_TLS_REJECT_UNAUTHORIZED`: `0`

- If you want to develop client with API integration, set env below.
  - `API_URL`: `http://localhost:7071/api/v1`

## Develop Command

```bash
# Install dependencies
yarn
# Run Lint
yarn lint
# Run Lint & auto fix
yarn fix
# Run unit test
yarn test
# Production build
yarn build
```

## Contributing

See [this guide](CONTRIBUTING.md).
