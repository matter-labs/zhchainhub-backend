import { Address } from "@zkchainhub/shared";

import { IPricingProvider, PriceResponse } from "../internal.js";

/**
 * DummyPricingProvider class that implements the IPricingProvider interface.
 * This provider returns a fixed price of 1 for each token address.
 */
export class DummyPricingProvider implements IPricingProvider {
    constructor(private readonly dummyPrice: number | undefined = undefined) {}
    async getTokenPrices(addresses: Address[]): Promise<PriceResponse> {
        return Promise.resolve(
            Object.fromEntries(addresses.map((address) => [address, this.dummyPrice])),
        );
    }
}
