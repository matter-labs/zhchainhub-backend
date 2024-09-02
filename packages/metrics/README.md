# ZKchainHub Metrics package

## Overview

The `@zkchainhub/metrics` package exposes services with different aggregated metrics from the ZKsync ecosystem and ZK chains.

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
import { L1MetricsService } from "@zkchainhub/metrics";
```

### Example

This packages requires that user injects instances of:

-   EvmProvider
-   IPricingProvider
-   IMetadataProvider

```typescript
// ... define needed dependencies

const l1MetricsService = new L1MetricsService(
    bridgeHubAddress,
    sharedBridgeAddress,
    stateTransitionManagerAddresses,
    evmProvider,
    pricingProvider,
    metadataProvider,
    logger,
);

await l1MetricsService.l1Tvl();
```

## API

### [L1MetricsService](./src/l1/l1MetricsService.ts)

Available methods

-   `l1Tvl()`
-   `getBatchesInfo(chainId: ChainId)`
-   `tvl(chainId: ChainId)`
-   `chainType(chainId: ChainId)`
-   `ethGasInfo()`
-   `getChainIds()`
-   `getBaseTokens(chainIds: ChainId[])`
-   `feeParams(chainId: ChainId)`

For more details on services, refer to their implementations.
