/**
 * Represents a pricing service that provides token prices.
 */
/**
 * Represents a pricing service that retrieves token prices.
 */
export interface IPricingService {
    /**
     * Retrieves the prices of the specified tokens.
     * @param tokenIds - An array of token IDs.
     * @param [config] - Optional configuration object.
     * @param config.currency - The currency in which the prices should be returned.
     * @returns A promise that resolves to a record containing the token IDs as keys and their corresponding prices as values.
     */
    getTokenPrices<TokenId extends string = string>(
        tokenIds: TokenId[],
        config?: { currency: string },
    ): Promise<Record<string, number>>;
}
