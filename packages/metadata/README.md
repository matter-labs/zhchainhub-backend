# ZKchainHub - Metadata Package

## Overview

This package contains providers for fetching chains and tokens metadata.

### chains.json

This file contains an array of Chain metadata. To add a new one, follow the following interface:

```json
{
    "chainId": 324, //mandatory
    "name": "ZKsyncERA", //mandatory
    "iconUrl": "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png", //optional
    "publicRpcs": [
        "https://mainnet.era.zksync.io",
        "https://zksync.drpc.org",
        "https://zksync.meowrpc.com"
    ], //optional,
    "explorerUrl": "https://explorer.zksync.io/", //optional
    "launchDate": 1679626800, //mandatory
    "chainType": "Rollup", // "Rollup" | "Validium"
    "baseToken": {
        "name": "Ether", //mandatory
        "symbol": "ETH", //mandatory
        "type": "native", // "native" | "erc20"
        "contractAddress": null, // null if "native", address if "erc20"
        "imageUrl": "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628", //optional
        "decimals": 18 //mandatory
    }
}
```

### tokens.json

This file contains an array of Token metadata. To add a new one, follow the following interface:

```json
{
    "name": "0x Protocol Token", //mandatory
    "symbol": "ZRX", //mandatory
    "contractAddress": "0xE41d2489571d322189246DaFA5ebDe1F4699F498", // null if "native", address if "erc20"
    "imageUrl": "https://assets.coingecko.com/coins/images/863/large/0x.png?1696501996", //optional
    "type": "erc20", // "native" | "erc20"
    "decimals": 18 //mandatory
}
```

Currently, there are three different providers:

-   `LocalFileMetadataProvider`
-   `GithubMetadataProvider`
-   `StaticMetadataProvider`

Inside [examples](./examples/) folder, you'll find json examples. Copy it to your local machine and edit metadata as wanted. Also, you can use it to host your own file on Github (recommended)

At [ZKchainHub-metadata repository](https://github.com/defi-wonderland/ZKchainHub-metadata) you'll find the latest curated list of tokens. To use it, remember to copy file url as raw content.

> https://raw.githubusercontent.com/defi-wonderland/ZKchainHub-metadata/79779a6313ab43af055f59861be012bf67bb908d/chains_mainnet.json

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

## Test

```bash
# unit tests
$ pnpm run test

# test coverage
$ pnpm run test:cov
```

## Usage

### Importing the Package

You can import the package in your TypeScript or JavaScript files as follows:

```typescript
import { MetadataProviderFactory } from "@zkchainhub/metadata";
```

### Example

You can manually instantiate any of the available providers or use the factory

```typescript
// manual
const metadataProvider = new LocalFileMetadataProvider(tokenJson, chainsJson, logger);

// factory
const metadataFromFactory = MetadataProviderFactory.create(providerOptions, additionalDependencies);

const chainsMap = await metadataProvider.getChainsMetadata();
const tokensArray = await metadataProvider.getTokensMetadata();
```

## API

### IMetadataProvider

#### `getChainsMetadata(): Promise<ZKChainMetadata>`

Retrieves the metadata for ZK chains of the ecosystem

#### `getTokensMetadata(): Promise<Token<TokenType>[]>`

Retrieves metadata for tokens of the ecosystem

## Contributing

To create a new provider, create it inside [`providers`](./src/providers/) folder and implement the [`IMetadataProvider`](./src/interfaces/metadata.interface.ts) interface.

Then, write the configuration interface inside [`metadataConfig.interface.ts`](./src/interfaces/metadataConfig.interface.ts) and add the provider to the [`MetadataProviderFactory`](./src/factory/index.ts) class.

Finally, export the provider and required files in [`external.ts`](./src/external.ts).
