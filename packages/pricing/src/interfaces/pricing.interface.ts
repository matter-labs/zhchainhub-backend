// providers
export type PricingProvider = "coingecko";

/**
 * Represents a pricing service that retrieves token prices.
 */
export interface IPricingProvider {
    /**
     * Retrieves the prices of the specified tokens.
     * @param tokenIds - An array of token IDs.
     * @returns A promise that resolves to a record containing the token IDs as keys and their corresponding prices as values.
     */
    getTokenPrices<TokenId extends string = string>(
        tokenIds: TokenId[],
    ): Promise<Record<string, number>>;
}
