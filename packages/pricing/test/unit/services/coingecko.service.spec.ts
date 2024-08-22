import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BASE_CURRENCY, Cache, ILogger } from "@zkchainhub/shared";

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
            const tokenIds = ["token1", "token2"];
            const expectedResponse: TokenPrices = {
                token1: { usd: 1.23 },
                token2: { usd: 4.56 },
            };

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            vi.spyOn(axios, "get").mockResolvedValueOnce({
                data: expectedResponse,
            });

            const result = await service.getTokenPrices(tokenIds);

            expect(result).toEqual({
                token1: 1.23,
                token2: 4.56,
            });
            expect(axios.get).toHaveBeenCalledWith(`simple/price`, {
                params: {
                    vs_currencies: BASE_CURRENCY,
                    ids: tokenIds.join(","),
                    precision: DECIMALS_PRECISION.toString(),
                },
            });
            expect(cache.store.mget).toHaveBeenCalledWith("token1", "token2");
            expect(cache.store.mset).toHaveBeenCalledWith([
                ["token1", 1.23],
                ["token2", 4.56],
            ]);
        });

        it("fetches cached prices and missing from coingecko", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const axios = service["axios"];

            const tokenIds = ["token1", "token2"];
            const expectedResponse: TokenPrices = {
                token2: { usd: 4.56 },
            };

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([1.25, undefined]);
            vi.spyOn(axios, "get").mockResolvedValueOnce({
                data: expectedResponse,
            });

            const result = await service.getTokenPrices(tokenIds);

            expect(result).toEqual({
                token1: 1.25,
                token2: 4.56,
            });
            expect(axios.get).toHaveBeenCalledWith(`simple/price`, {
                params: {
                    vs_currencies: BASE_CURRENCY,
                    ids: "token2",
                    precision: DECIMALS_PRECISION.toString(),
                },
            });
            expect(cache.store.mget).toHaveBeenCalledWith("token1", "token2");
            expect(cache.store.mset).toHaveBeenCalledWith([["token2", 4.56]]);
        });

        it("throw ApiNotAvailable when Coingecko returns a 500 family exception", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const mockAxios = new MockAdapter(service["axios"]);
            const tokenIds = ["token1", "token2"];

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            mockAxios.onGet().replyOnce(503, {
                data: {},
                status: 503,
                statusText: "Service not available",
            });

            await expect(service.getTokenPrices(tokenIds)).rejects.toThrow(
                new ApiNotAvailable("Coingecko"),
            );
        });

        it("throw RateLimitExceeded when Coingecko returns 429 exception", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const mockAxios = new MockAdapter(service["axios"]);
            const tokenIds = ["token1", "token2"];

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            mockAxios.onGet().replyOnce(429, {
                data: {},
                status: 429,
                statusText: "Too Many Requests",
            });

            await expect(service.getTokenPrices(tokenIds)).rejects.toThrow(new RateLimitExceeded());
        });

        it("throw an HttpException with the error message when an error occurs", async () => {
            const { service, mockCache: cache } = mockServices({ apiKey, apiBaseUrl, apiType });
            const mockAxios = new MockAdapter(service["axios"]);
            const tokenIds = ["invalidTokenId", "token2"];

            vi.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            mockAxios.onGet().replyOnce(400, {
                data: {
                    message: "Invalid token ID",
                },
                status: 400,
                statusText: "Bad Request",
            });

            await expect(service.getTokenPrices(tokenIds)).rejects.toThrow();
        });
    });
});
