import { createMock } from "@golevelup/ts-jest";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AxiosInstance } from "axios";
import MockAdapter from "axios-mock-adapter";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

import { ApiNotAvailable, RateLimitExceeded } from "@zkchainhub/pricing/exceptions";
import { CoingeckoService, DECIMALS_PRECISION } from "@zkchainhub/pricing/services";
import { TokenPrices } from "@zkchainhub/pricing/types/tokenPrice.type";
import { BASE_CURRENCY } from "@zkchainhub/shared";

export const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

describe("CoingeckoService", () => {
    let service: CoingeckoService;
    let axios: AxiosInstance;
    let mockAxios: MockAdapter;
    let cache: Cache;
    const apiKey = "COINGECKO_API_KEY";
    const apiBaseUrl = "https://api.coingecko.com/api/v3/";

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CoingeckoService,
                {
                    provide: CoingeckoService,
                    useFactory: (logger: Logger, cache: Cache) => {
                        return new CoingeckoService(apiKey, apiBaseUrl, logger, cache);
                    },
                    inject: [WINSTON_MODULE_PROVIDER, CACHE_MANAGER],
                },
                {
                    provide: WINSTON_MODULE_PROVIDER,
                    useValue: mockLogger,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: createMock<Cache>({
                        store: createMock<Cache["store"]>({
                            mget: jest.fn(),
                            mset: jest.fn(),
                        }),
                    }),
                },
            ],
        }).compile();

        service = module.get<CoingeckoService>(CoingeckoService);
        axios = service["axios"];
        mockAxios = new MockAdapter(axios);
        cache = module.get<Cache>(CACHE_MANAGER);
    });

    afterEach(() => {
        jest.clearAllMocks();
        mockAxios.reset();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should have an axios instance", () => {
        expect(axios).toBeDefined();
        expect(axios.defaults.baseURL).toBe(apiBaseUrl);
        expect(axios.defaults.headers.common).toEqual(
            expect.objectContaining({
                "x-cg-pro-api-key": apiKey,
                Accept: "application/json",
            }),
        );
    });

    describe("getTokenPrices", () => {
        it("fetches all token prices from Coingecko", async () => {
            const tokenIds = ["token1", "token2"];
            const expectedResponse: TokenPrices = {
                token1: { usd: 1.23 },
                token2: { usd: 4.56 },
            };

            jest.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            jest.spyOn(axios, "get").mockResolvedValueOnce({
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

        it("throw ApiNotAvailable when Coingecko returns a 500 family exception", async () => {
            const tokenIds = ["token1", "token2"];

            jest.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
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
            const tokenIds = ["token1", "token2"];

            jest.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
            mockAxios.onGet().replyOnce(429, {
                data: {},
                status: 429,
                statusText: "Too Many Requests",
            });

            await expect(service.getTokenPrices(tokenIds)).rejects.toThrow(new RateLimitExceeded());
        });

        it("throw an HttpException with the error message when an error occurs", async () => {
            const tokenIds = ["invalidTokenId", "token2"];

            jest.spyOn(cache.store, "mget").mockResolvedValueOnce([null, null]);
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
