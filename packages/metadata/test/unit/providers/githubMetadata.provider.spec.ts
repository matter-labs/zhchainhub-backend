import MockAdapter from "axios-mock-adapter";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Cache, ILogger, ZKChainMetadataItem } from "@zkchainhub/shared";

import { FetchError, InvalidSchema } from "../../../src/internal";
import { GithubMetadataProvider } from "../../../src/providers/githubMetadata.provider";
import {
    chainJsonUrl,
    mockChainData,
    mockTokenData,
    tokenJsonUrl,
} from "../../fixtures/metadata.fixtures";

const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

const mockCache: Cache = {
    store: {} as any,
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    reset: vi.fn(),
};

describe("GithubMetadataProvider", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("constructor", () => {
        it("create a new instance of GithubMetadataProvider", () => {
            const tokenJsonUrl = "https://github.com/token.json";
            const chainJsonUrl = "https://github.com/chain.json";

            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );

            expect(provider).toBeInstanceOf(GithubMetadataProvider);
            expect(provider["tokenJsonUrl"]).toBe(tokenJsonUrl);
            expect(provider["chainJsonUrl"]).toBe(chainJsonUrl);
        });

        it("throw an InvalidSchema error if the tokenJsonUrl is invalid", () => {
            const tokenJsonUrl = "invalid-url";
            const chainJsonUrl = "https://example.com/chain.json";
            const logger = {} as ILogger;
            const cache = {} as Cache;

            expect(
                () => new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, logger, cache),
            ).toThrow(InvalidSchema);
        });

        it("throw an InvalidSchema error if the chainJsonUrl is invalid", () => {
            const tokenJsonUrl = "https://example.com/token.json";
            const chainJsonUrl = "";
            const logger = {} as ILogger;
            const cache = {} as Cache;

            expect(
                () => new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl, logger, cache),
            ).toThrow(InvalidSchema);
        });

        it("throw an InvalidSchema error if the chainJsonUrl is undefined", () => {
            const tokenJsonUrl = "https://example.com/token.json";
            const chainJsonUrl = undefined;
            const logger = {} as ILogger;
            const cache = {} as Cache;

            expect(
                () => new GithubMetadataProvider(tokenJsonUrl, chainJsonUrl as any, logger, cache),
            ).toThrow(InvalidSchema);
        });
    });

    describe("getChainsMetadata", () => {
        it("return the cached chains metadata", async () => {
            const cachedData = new Map<bigint, ZKChainMetadataItem>([
                [
                    324n,
                    {
                        chainId: 324n,
                        name: "ZKsyncERA",
                        iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
                        publicRpcs: [
                            "https://mainnet.era.zksync.io",
                            "https://zksync.drpc.org",
                            "https://zksync.meowrpc.com",
                        ],
                        explorerUrl: "https://explorer.zksync.io/",
                        launchDate: 1679626800,
                        chainType: "Rollup",
                        baseToken: {
                            name: "Ethereum",
                            symbol: "ETH",
                            coingeckoId: "ethereum",
                            type: "native",
                            contractAddress: null,
                            decimals: 18,
                            imageUrl:
                                "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                        },
                    },
                ],
            ]);
            vi.spyOn(mockCache, "get").mockResolvedValue(cachedData);
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );

            const axiosSpy = vi.spyOn(provider["axios"], "get");
            const result = await provider.getChainsMetadata();

            expect(axiosSpy).not.toHaveBeenCalled();
            expect(mockCache.get).toHaveBeenCalledWith("github-metadata-chains");
            expect(result).toBeInstanceOf(Map);
            expect(result.size).toBe(1);

            const chain1 = result.get(324n) as ZKChainMetadataItem;
            expect(chain1).toBeDefined();
            expect(chain1).toMatchObject({
                chainId: 324n,
                name: "ZKsyncERA",
                iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
                publicRpcs: [
                    "https://mainnet.era.zksync.io",
                    "https://zksync.drpc.org",
                    "https://zksync.meowrpc.com",
                ],
                explorerUrl: "https://explorer.zksync.io/",
                launchDate: 1679626800,
                chainType: "Rollup",
                baseToken: {
                    name: "Ethereum",
                    symbol: "ETH",
                    coingeckoId: "ethereum",
                    type: "native",
                    contractAddress: null,
                    decimals: 18,
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                },
            });
        });

        it("fetches and return the chains metadata", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axios = provider["axios"];

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            const axiosGetMock = vi
                .spyOn(axios, "get")
                .mockResolvedValueOnce({ data: mockChainData });

            const result = await provider.getChainsMetadata();

            expect(axiosGetMock).toHaveBeenCalledWith(chainJsonUrl);
            expect(mockCache.set).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Map);
            expect(result.size).toBe(2);

            const chain1 = result.get(324n) as ZKChainMetadataItem;
            expect(chain1).toBeDefined();
            expect(chain1).toMatchObject({
                chainId: 324n,
                name: "ZKsyncERA",
                iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
                publicRpcs: [
                    "https://mainnet.era.zksync.io",
                    "https://zksync.drpc.org",
                    "https://zksync.meowrpc.com",
                ],
                explorerUrl: "https://explorer.zksync.io/",
                launchDate: 1679626800,
                chainType: "Rollup",
                baseToken: {
                    name: "Ethereum",
                    symbol: "ETH",
                    coingeckoId: "ethereum",
                    type: "native",
                    contractAddress: null,
                    decimals: 18,
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                },
            });

            const chain2 = result.get(388n) as ZKChainMetadataItem;
            expect(chain2).toBeDefined();
            expect(chain2).toMatchObject({
                chainId: 388n,
                name: "Cronos",
                chainType: "Validium",
                publicRpcs: ["https://mainnet.zkevm.cronos.org"],
                explorerUrl: "https://explorer.zkevm.cronos.org/",
                launchDate: 1679626800,
                baseToken: {
                    name: "zkCRO",
                    symbol: "zkCRO",
                    coingeckoId: "unknown",
                    type: "erc20",
                    contractAddress: "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2",
                    decimals: 18,
                    imageUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
                },
            });
        });

        it("should throw an error if the schema is invalid", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axios = provider["axios"];

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            const axiosGetMock = vi
                .spyOn(axios, "get")
                .mockResolvedValueOnce({ data: [{ invalid: "data" }] });

            await expect(provider.getChainsMetadata()).rejects.toThrow(InvalidSchema);
            expect(axiosGetMock).toHaveBeenCalledWith(chainJsonUrl);
        });

        it("should throw an error if the fetch fails with 404 error", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axios = new MockAdapter(provider["axios"]);

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            axios.onGet().replyOnce(404, {
                data: {},
                status: 404,
                statusText: "Not found",
            });

            await expect(provider.getChainsMetadata()).rejects.toThrow(FetchError);
        });

        it("should throw an error if the fetch fails with 500 error", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axios = new MockAdapter(provider["axios"]);

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            axios.onGet().replyOnce(500, {
                data: {},
                status: 500,
                statusText: "Internal Server Error",
            });

            await expect(provider.getChainsMetadata()).rejects.toThrow(FetchError);
        });
    });

    describe("getTokensMetadata", () => {
        it("returns cached tokens metadata", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axiosSpy = vi.spyOn(provider["axios"], "get");
            vi.spyOn(mockCache, "get").mockResolvedValue(mockTokenData);

            const result = await provider.getTokensMetadata();

            expect(mockCache.get).toHaveBeenCalledWith("github-metadata-tokens");
            expect(axiosSpy).not.toHaveBeenCalled();
            expect(result).toEqual(mockTokenData);
        });

        it("fetches and return the tokens metadata", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axios = provider["axios"];

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            const axiosGetMock = vi
                .spyOn(axios, "get")
                .mockResolvedValueOnce({ data: mockTokenData });

            const result = await provider.getTokensMetadata();

            expect(axiosGetMock).toHaveBeenCalledWith(tokenJsonUrl);
            expect(mockCache.set).toHaveBeenCalledWith("github-metadata-tokens", mockTokenData);
            expect(result).toEqual(mockTokenData);
        });

        it("should throw an error if the schema is invalid", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axios = provider["axios"];

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            const axiosGetMock = vi
                .spyOn(axios, "get")
                .mockResolvedValueOnce({ data: [{ invalid: "data" }] });

            await expect(provider.getTokensMetadata()).rejects.toThrow(InvalidSchema);
            expect(axiosGetMock).toHaveBeenCalledWith(tokenJsonUrl);
        });

        it("should throw an error if the fetch fails with 404 error", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axios = new MockAdapter(provider["axios"]);

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            axios.onGet().replyOnce(404, {
                data: {},
                status: 404,
                statusText: "Not found",
            });

            await expect(provider.getTokensMetadata()).rejects.toThrow(FetchError);
        });

        it("should throw an error if the fetch fails with 500 error", async () => {
            const provider = new GithubMetadataProvider(
                tokenJsonUrl,
                chainJsonUrl,
                mockLogger,
                mockCache,
            );
            const axios = new MockAdapter(provider["axios"]);

            vi.spyOn(mockCache, "get").mockResolvedValue(undefined);
            axios.onGet().replyOnce(500, {
                data: {},
                status: 500,
                statusText: "Internal Server Error",
            });

            await expect(provider.getTokensMetadata()).rejects.toThrow(FetchError);
        });
    });
});
