import { Address } from "@zkchainhub/shared";

import { PriceResponse } from "../internal.js";

// providers
export type PricingProvider = "coingecko";

/**
 * Represents a pricing service that retrieves token prices.
 * @dev is service responsibility to map address to their internal ID
 * @dev for native token (eg. ETH), use the one address
 */
export interface IPricingProvider {
    /**
     * Retrieves the prices of the specified tokens.
     * @param addresses - An array of token addresses.
     * @returns A promise that resolves to a record containing the token address as keys and their corresponding prices or undefined as values
     */
    getTokenPrices(addresses: Address[]): Promise<PriceResponse>;
}
