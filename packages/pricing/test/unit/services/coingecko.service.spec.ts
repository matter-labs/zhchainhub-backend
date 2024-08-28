import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Address, BASE_CURRENCY, Cache, ILogger } from "@zkchainhub/shared";

import {
    ApiNotAvailable,
    CoingeckoProvider,
    DECIMALS_PRECISION,
    RateLimitExceeded,
    TokenPrices,
} from "../../../src/internal.js";

function mockServices({
    apiKey,
    apiBaseUrl,
    apiType,
}: {
    apiKey: string;
    apiBaseUrl: string;
    apiType: "demo" | "pro";
}) {
    const mockCache: Cache = {
        store: {
            mget: vi.fn(),
            mset: vi.fn(),
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
            reset: vi.fn(),
            mdel: vi.fn(),
            keys: vi.fn(),
            ttl: vi.fn(),
        },
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        reset: vi.fn(),
    };

    const mockLogger: ILogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    };

    const service = new CoingeckoProvider({ apiKey, apiBaseUrl, apiType }, mockCache, mockLogger);

    return { service, mockCache, mockLogger };
}

describe("CoingeckoProvider", () => {
    const apiKey = "COINGECKO_API_KEY";
    const apiBaseUrl = "https://api.coingecko.com/api/v3/";
    const apiType = "demo";

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should be defined", () => {
        const { service } = mockServices({ apiKey, apiBaseUrl, apiType });
        expect(service).toBeDefined();
    });

    it("should have an axios instance", () => {
        const { service } = mockServices({ apiKey, apiBaseUrl, apiType });
        const axios = service["axios"];
        expect(axios).toBeDefined();
        expect(axios.defaults.baseURL).toBe(apiBaseUrl);
        expect(axios.defaults.headers.common).toEqual(
            expect.objectContaining({
                "x-cg-demo-api-key": apiKey,
                Accept: "application/json",
            }),
        );
    });

    describe("getTokenPrices", () => {
        it("fetches all token prices from Coingecko", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const axios = service["axios"];
            const tokenAddresses: Address[] = [
                "0x0000000000000000000000000000000000000001",
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                "0x61299774020dA444Af134c82fa83E3810b309991", // unknown token
            ];
            const tokenIds = ["ethereum", "usd-coin"];

            const expectedResponse: TokenPrices = {
                ethereum: { usd: 1.23 },
                "usd-coin": { usd: 4.56 },
            };
            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            vi.spyOn(axios, "get").mockResolvedValueOnce({
                data: expectedResponse,
            });

            const result = await service.getTokenPrices(tokenAddresses);

            expect(result).toEqual({
                "0x0000000000000000000000000000000000000001": 1.23,
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": 4.56,
                "0x61299774020dA444Af134c82fa83E3810b309991": undefined,
            });
            expect(axios.get).toHaveBeenCalledWith(`simple/price`, {
                params: {
                    vs_currencies: BASE_CURRENCY,
                    ids: tokenIds.join(","),
                    precision: DECIMALS_PRECISION.toString(),
                },
            });
            expect(cache.store.mget).toHaveBeenCalledWith("ethereum", "usd-coin");
            expect(cache.store.mset).toHaveBeenCalledWith([
                ["ethereum", 1.23],
                ["usd-coin", 4.56],
            ]);
        });

        it("fetches cached prices and missing from coingecko", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const axios = service["axios"];

            const tokenAddresses: Address[] = [
                "0x0000000000000000000000000000000000000001",
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                "0x61299774020dA444Af134c82fa83E3810b309991", // unknown token
            ];
            const expectedResponse: TokenPrices = {
                "usd-coin": { usd: 4.56 },
            };

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([1.23, undefined]);
            vi.spyOn(axios, "get").mockResolvedValueOnce({
                data: expectedResponse,
            });

            const result = await service.getTokenPrices(tokenAddresses);

            expect(result).toEqual({
                "0x0000000000000000000000000000000000000001": 1.23,
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": 4.56,
                "0x61299774020dA444Af134c82fa83E3810b309991": undefined,
            });
            expect(axios.get).toHaveBeenCalledWith(`simple/price`, {
                params: {
                    vs_currencies: BASE_CURRENCY,
                    ids: "usd-coin",
                    precision: DECIMALS_PRECISION.toString(),
                },
            });
            expect(cache.store.mget).toHaveBeenCalledWith("ethereum", "usd-coin");
            expect(cache.store.mset).toHaveBeenCalledWith([["usd-coin", 4.56]]);
        });

        it("returns empty record for empty array", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const axios = service["axios"];

            const tokenAddresses: Address[] = [];
            const expectedResponse: TokenPrices = {};

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([]);
            vi.spyOn(axios, "get").mockResolvedValueOnce({
                data: expectedResponse,
            });

            const result = await service.getTokenPrices(tokenAddresses);

            expect(result).toEqual({});
            expect(axios.get).not.toHaveBeenCalledWith();
            expect(cache.store.mget).toHaveBeenCalledWith();
            expect(cache.store.mset).not.toHaveBeenCalled();
        });

        it("throw ApiNotAvailable when Coingecko returns a 500 family exception", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const mockAxios = new MockAdapter(service["axios"]);
            const tokenAddresses: Address[] = [
                "0x0000000000000000000000000000000000000001",
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                "0x61299774020dA444Af134c82fa83E3810b309991", // unknown token
            ];

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            mockAxios.onGet().replyOnce(503, {
                data: {},
                status: 503,
                statusText: "Service not available",
            });

            await expect(service.getTokenPrices(tokenAddresses)).rejects.toThrow(
                new ApiNotAvailable("Coingecko"),
            );
        });

        it("throw RateLimitExceeded when Coingecko returns 429 exception", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const mockAxios = new MockAdapter(service["axios"]);
            const tokenAddresses: Address[] = [
                "0x0000000000000000000000000000000000000001",
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                "0x61299774020dA444Af134c82fa83E3810b309991", // unknown token
            ];

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            mockAxios.onGet().replyOnce(429, {
                data: {},
                status: 429,
                statusText: "Too Many Requests",
            });

            await expect(service.getTokenPrices(tokenAddresses)).rejects.toThrow(
                new RateLimitExceeded(),
            );
        });
    });
});
