# ZKchainHub Chain Providers package

## Overview

The `@zkchainhub/chain-providers` package provides wrappers of the `Viem` library to interact with EVM-based blockchains and ZK chains of the ZKsync ecosystem.

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
import { EvmProvider } from "@zkchainhub/chain-providers";
```

### Example

```typescript
// EVM-provider
const rpcUrls = [...]; //non-empty
const chain = mainnet; // from viem/chains

const evmProvider = new EvmProvider(rpcUrls, chain, logger);

const gasPrice = await evmProvider.getGasPrice();

const result = await evmProvider.readContract(address, abi, "myfunction", [arg1, arg2]);

// ZK-chain provider
const zkChainProvider = new ZKChainProvider(rpcUrls, chain, logger);

const l2Tps = await zkChainProvider.tps();
```

## API

### [EvmProvider](./src/providers/evmProvider.service.ts)

Available methods

-   `getMulticall3Address()`
-   `getBalance(address: Address)`
-   `getBlockNumber()`
-   `getBlockByNumber(blockNumber: number)`
-   `getGasPrice()`
-   `estimateGas(args: EstimateGasParameters<typeof this.chain>)`
-   `getStorageAt(address: Address, slot: number | Hex)`
-   `readContract(contractAddress: Address, abi: TAbi functionName: TFunctionName, args?: TArgs)`
-   `batchRequest(abi: AbiWithConstructor,bytecode: Hex, args: ContractConstructorArgs<typeof abi>, constructorReturnParams: ReturnType)`
-   `multicall(args: MulticallParameters<contracts, allowFailure>)`

### [ZKChainProvider](./src/providers/zkChainProvider.service.ts)

Available methods

-   `getL1BatchDetails(batchNumber: number)`
-   `getL1BatchNumber()`
-   `avgBlockTime(range: number = 1000)`
-   `tps()`

For more details on both providers, refer to their implementations.
