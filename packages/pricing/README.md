# ZKchainHub Pricing package

## Overview

The `@zkchainhub/pricing` package exposes different providers for retrieving token prices.

Currently, there are two different providers:

-   `CoingeckoProvider`
-   `DummyPricingProvider`

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
import { PricingProviderFactory } from "@zkchainhub/pricing";
```

### Example

You can manually instantiate any of the available providers or use the factory

```typescript
// manual
const pricingProvider = new CoingeckoProvider({ ...options }, cache, logger);

// factory
const pricingFromFactory = PricingProviderFactory.create(providerOptions, additionalDependencies);

const tokenAddresses = [
    "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
    "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
    "0x0000000000000000000000000000000000000001", //convention to fetch ETH price
];

const response = await pricingProvider.getTokenPrices(tokenAddresses);

for (let [address, price] of response) {
    console.log(`The price of ${address} is ${price ? price.toString() : "not found"}`);
}
```

## API

### IPricingProvider

#### `getTokenPrices(addresses: Address[]): Promise<PriceResponse>`

Retrieves the price for the list of token.

-   **Parameters:**
    -   `addresses` (Address[]): array of token addresses that we want to fetch
-   **Returns:** `Promise<PriceResponse>`: A promise that resolves to a map of Address to price or undefined if not found

## Contributing

1. To create a new provider, create it inside [`providers`](./src/providers/) folder and implement the [`IPricingProvider`](./src/interfaces/pricing.interface.ts) interface.

> Note 1: it is the provider's responsibility to map token addresses to their internal id if needed

> Note 2: for native token (eg. ETH), use the one address

2. Then, write the configuration interface inside [`pricingConfig.interface.ts`](./src/interfaces/pricingConfig.interface.ts) and add the provider to the [`PricingProviderFactory`](./src/factory/index.ts) class.

3. Finally, export the provider and required files in [`external.ts`](./src/external.ts).
