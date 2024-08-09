import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, LoggerService } from "@nestjs/common";
import axios, { AxiosInstance, isAxiosError } from "axios";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { ApiNotAvailable, RateLimitExceeded } from "@zkchainhub/pricing/exceptions";
import { IPricingService } from "@zkchainhub/pricing/interfaces";
import { TokenPrices } from "@zkchainhub/pricing/types/tokenPrice.type";
import { BASE_CURRENCY } from "@zkchainhub/shared";

export const AUTH_HEADER = "x-cg-pro-api-key";
export const DECIMALS_PRECISION = 3;

/**
 * Service for fetching token prices from Coingecko API.
 * Prices are always denominated in USD.
 */
@Injectable()
export class CoingeckoService implements IPricingService {
    private readonly axios: AxiosInstance;

    /**
     *
     * @param apiKey  * @param apiKey - Coingecko API key.
     * @param apiBaseUrl - Base URL for Coingecko API. If you have a Pro account, you can use the Pro API URL.
     */
    constructor(
        private readonly apiKey: string,
        private readonly apiBaseUrl: string = "https://api.coingecko.com/api/v3/",
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {
        this.axios = axios.create({
            baseURL: apiBaseUrl,
            headers: {
                common: {
                    [AUTH_HEADER]: apiKey,
                    Accept: "application/json",
                },
            },
        });
        this.axios.interceptors.response.use(
            (response) => response,
            (error: unknown) => this.handleError(error),
        );
    }

    /**
     * @param tokenIds - An array of Coingecko Tokens IDs.
     * @returns A promise that resolves to a record of token prices in USD.
     */
    async getTokenPrices(tokenIds: string[]): Promise<Record<string, number>> {
        const cachedTokenPrices = await this.getTokenPricesFromCache(tokenIds);
        const missingTokenIds: string[] = [];
        const cachedMap = cachedTokenPrices.reduce(
            (result, price, index) => {
                if (price) result[tokenIds.at(index) as string] = price;
                else missingTokenIds.push(tokenIds.at(index) as string);

                return result;
            },
            {} as Record<string, number>,
        );

        const missingTokenPrices = await this.fetchTokenPrices(missingTokenIds);

        await this.saveTokenPricesToCache(missingTokenPrices);

        return { ...cachedMap, ...missingTokenPrices };
    }

    /**
     * Retrieves multiple token prices from the cache at once.
     * @param keys - An array of cache keys.
     * @returns A promise that resolves to an array of token prices (number or null).
     */
    private async getTokenPricesFromCache(keys: string[]): Promise<(number | null)[]> {
        return this.cacheManager.store.mget(...keys) as Promise<(number | null)[]>;
    }

    /**
     * Saves multiple token prices to the cache at once.
     *
     * @param prices - The token prices to be saved.
     * @param currency - The currency in which the prices are denominated.
     */
    private async saveTokenPricesToCache(prices: Record<string, number>) {
        if (Object.keys(prices).length === 0) return;

        this.cacheManager.store.mset(
            Object.entries(prices).map(([tokenId, price]) => [tokenId, price]),
        );
    }

    private async fetchTokenPrices(tokenIds: string[]): Promise<Record<string, number>> {
        if (tokenIds.length === 0) {
            return {};
        }

        return this.axios
            .get<TokenPrices>("simple/price", {
                params: {
                    vs_currencies: BASE_CURRENCY,
                    ids: tokenIds.join(","),
                    precision: DECIMALS_PRECISION.toString(),
                },
            })
            .then((response) => {
                const { data } = response;
                return Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [key, value.usd]),
                );
            });
    }

    /**
     * Handles errors that occur during API requests.
     * @param error - The error object to handle.
     * @throws {ApiNotAvailable} - If the error is a server-side error (status code >= 500).
     * @throws {RateLimitExceeded} - If the error is a rate limit exceeded error (status code 429).
     * @throws {Error} - If the error is a client-side error or an unknown error.
     * @throws {Error} - If the error is a non-network related error.
     */
    private handleError(error: unknown) {
        let exception;

        if (isAxiosError(error)) {
            const statusCode = error.response?.status ?? 0;
            if (statusCode >= 500) {
                exception = new ApiNotAvailable("Coingecko");
            } else if (statusCode === 429) {
                exception = new RateLimitExceeded();
            } else {
                exception = new Error(
                    error.response?.data || "An error occurred while fetching data",
                );
            }

            throw exception;
        } else {
            this.logger.error(error);
            throw new Error("A non network related error occurred");
        }
    }
}
