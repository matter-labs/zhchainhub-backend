# ZKchainHub API

## Overview

The `@zkchainhub/api` app is an Express server that exposes an API where you can fetch information about ZKsync ecosystem and their chains.

## 📋 Prerequisites

-   Ensure you have `node >= 20.0.0` and `pnpm >= 9.5.0` installed.

## Installation

```bash
$ pnpm install
```

## Building

To build the monorepo packages, run:

```bash
$ pnpm build
```

## ⚙️ Setting up env variables

-   Create `.env` file and copy paste `.env.example` content in there.

```
$ cp .env.example .env
```

Available options:
| Name | Description | Default | Required | Notes |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------|-----------|----------------------------------|-----------------------------------------------------------------|
| `PORT` | Port on which API is made available | 3000 | No | |
| `ENVIRONMENT` | Environment we are using (`'mainnet'`, `'testnet'`, `'local'`) | 'mainnet' | No | |
| `BRIDGE_HUB_ADDRESS` | Bridge Hub address | N/A | Yes | |
| `SHARED_BRIDGE_ADDRESS` | Shared Bridge address | N/A | Yes | |
| `STATE_MANAGER_ADDRESSES` | CSV list of State manager addresses | N/A | Yes | |
| `L1_RPC_URLS` | JSON array of RPC URLs. For example, ["https://eth.llamarpc.com","https://rpc.flashbots.net/fast"] | N/A | Yes | You can check [Chainlist](https://chainlist.org/) for a list of public RPCs |
| `L2_RPC_URLS_MAP` | JSON from chain id to CSV list of L2 RPC URLs. For example, {"324":"https://mainnet.era.zksync.io,https://zksync.drpc.org"} | N/A | No | You can check [Chainlist](https://chainlist.org/) for a list of public RPCs |
| `PRICING_SOURCE` | Pricing source to use (`'dummy'`, `'coingecko'`) | 'dummy' | No | |
| `DUMMY_PRICE` | Price for dummy pricing source | undefined | No | Only applicable if `PRICING_SOURCE` is `'dummy'` |
| `COINGECKO_API_KEY` | API key for CoinGecko | N/A | If `'coingecko'` is selected | You can get an API key by creating an account on [CoinGecko's site](https://www.coingecko.com/en/api) |
| `COINGECKO_BASE_URL` | Base URL for CoinGecko | N/A | If `'coingecko'` is selected | |
| `COINGECKO_API_TYPE` | CoinGecko API Type (`'demo'` or `'pro'`) | N/A | If `'coingecko'` is selected | |
| `METADATA_SOURCE` | Metadata source to use (`'github'`, `'local'`, `'static'`) | N/A | Yes | |
| `METADATA_TOKEN_URL` | Metadata tokens URL | N/A | If `METADATA_SOURCE` is `'github'` | |
| `METADATA_CHAIN_URL` | Metadata chains URL | N/A | If `METADATA_SOURCE` is `'github'` | |
| `METADATA_TOKEN_JSON_PATH` | Metadata tokens JSON file path | N/A | If `METADATA_SOURCE` is `'local'` | See examples in `packages/metadata` |
| `METADATA_CHAIN_JSON_PATH` | Metadata chain JSON file path | N/A | If `METADATA_SOURCE` is `'local'` | See examples in `packages/metadata` |

## Running the app

```bash
# development watch mode
$ pnpm run dev

# production mode
$ pnpm run start

```

Verify that ZKchainHub API is running on http://localhost:3000 (or the port specified)

## Test

```bash
# unit tests
$ pnpm run test

# test coverage
$ pnpm run test:cov
```

## API

### Metrics routes

-   `GET /metrics/ecosystem`: Retrieves overall ecosystem metrics
-   `GET /metrics/zkchain/:chainId`: Retrieves chain specific metrics

## Docs

Locally Swagger docs are available at http://localhost:3000/docs
