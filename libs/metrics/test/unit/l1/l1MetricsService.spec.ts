import { createMock } from "@golevelup/ts-jest";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Address, encodeFunctionData, erc20Abi, parseEther, zeroAddress } from "viem";

import {
    InvalidChainId,
    InvalidChainType,
    L1MetricsServiceException,
} from "@zkchainhub/metrics/exceptions";
import { L1MetricsService } from "@zkchainhub/metrics/l1/";
import {
    bridgeHubAbi,
    diamondProxyAbi,
    multicall3Abi,
    sharedBridgeAbi,
} from "@zkchainhub/metrics/l1/abis";
import { IPricingService, PRICING_PROVIDER } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { MulticallNotFound } from "@zkchainhub/providers/exceptions";
import {
    BatchesInfo,
    ChainId,
    ChainType,
    erc20Tokens,
    ETH_TOKEN_ADDRESS,
    nativeToken,
    Token,
    TokenType,
    vitalikAddress,
    WETH,
} from "@zkchainhub/shared";

// Mock implementations of the dependencies
const mockEvmProviderService = createMock<EvmProviderService>();

const mockPricingService = createMock<IPricingService>();

const ONE_ETHER = parseEther("1");
jest.mock("@zkchainhub/shared/constants/token", () => ({
    ...jest.requireActual("@zkchainhub/shared/constants/token"),
    erc20Tokens: {
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
            name: "USDC",
            symbol: "USDC",
            contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            coingeckoId: "usd-coin",
            imageUrl:
                "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
            type: "erc20",
            decimals: 6,
        },
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": {
            name: "Wrapped BTC",
            symbol: "WBTC",
            contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            coingeckoId: "wrapped-bitcoin",
            imageUrl:
                "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
            type: "erc20",
            decimals: 8,
        },
    },
    get tokens() {
        return [
            {
                name: "Ethereum",
                symbol: "ETH",
                contractAddress: null,
                coingeckoId: "ethereum",
                type: "native",
                imageUrl:
                    "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                decimals: 18,
            },
            {
                name: "USDC",
                symbol: "USDC",
                contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                coingeckoId: "usd-coin",
                imageUrl:
                    "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                type: "erc20",
                decimals: 6,
            },
            {
                name: "Wrapped BTC",
                symbol: "WBTC",
                contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                coingeckoId: "wrapped-bitcoin",
                imageUrl:
                    "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
                type: "erc20",
                decimals: 8,
            },
        ];
    },
}));

export const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

const mockMetricsModule = async (
    mockedBridgeHubAddress: Address,
    mockedSharedBridgeAddress: Address,
    mockedSTMAddresses: Address[],
) => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            L1MetricsService,
            {
                provide: L1MetricsService,
                useFactory: (
                    mockEvmProviderService: EvmProviderService,
                    mockPricingService: IPricingService,
                    logger: Logger,
                ) => {
                    return new L1MetricsService(
                        mockedBridgeHubAddress,
                        mockedSharedBridgeAddress,
                        mockedSTMAddresses,
                        mockEvmProviderService,
                        mockPricingService,
                        logger,
                    );
                },
                inject: [EvmProviderService, PRICING_PROVIDER, WINSTON_MODULE_PROVIDER],
            },
            {
                provide: EvmProviderService,
                useValue: mockEvmProviderService,
            },
            {
                provide: PRICING_PROVIDER,
                useValue: mockPricingService,
            },
            {
                provide: WINSTON_MODULE_PROVIDER,
                useValue: mockLogger,
            },
        ],
    }).compile();

    return module.get<L1MetricsService>(L1MetricsService);
};

describe("L1MetricsService", () => {
    let l1MetricsService: L1MetricsService;
    const mockedBridgeHubAddress = "0x1234567890123456789012345678901234567890";
    const mockedSharedBridgeAddress = "0x1234567890123456789012345678901234567891";
    const mockedSTMAddresses: Address[] = [
        "0x1234567890123456789012345678901234567892",
        "0x1234567890123456789012345678901234567893",
    ];
    beforeEach(async () => {
        l1MetricsService = await mockMetricsModule(
            mockedBridgeHubAddress,
            mockedSharedBridgeAddress,
            mockedSTMAddresses,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("constructor", () => {
        it("initialize bridgeHub and sharedBridge", () => {
            expect(l1MetricsService["bridgeHubAddress"]).toEqual(mockedBridgeHubAddress);
            expect(l1MetricsService["sharedBridgeAddress"]).toEqual(mockedSharedBridgeAddress);
            expect(l1MetricsService["stateTransitionManagerAddresses"]).toEqual(mockedSTMAddresses);
        });

        it("initialize diamondContracts map as empty", () => {
            expect(l1MetricsService["diamondContracts"].size).toBe(0);
        });
    });

    describe("l1Tvl", () => {
        it("return the TVL on L1 Shared Bridge", async () => {
            const mockMulticallBalances = [
                60_841_657_140641n,
                135_63005559n,
                123_803_824374847279970609n,
            ]; // Mocked balances
            const mockPrices = { "wrapped-bitcoin": 66_129, "usd-coin": 0.999, ethereum: 3_181.09 }; // Mocked prices
            const multicallAddress = "0x123452";

            jest.spyOn(mockEvmProviderService, "getMulticall3Address").mockReturnValue(
                multicallAddress,
            );
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue(
                mockMulticallBalances,
            );
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1MetricsService.l1Tvl();

            expect(result).toHaveLength(3);
            expect(result).toEqual([
                {
                    amount: "123803.824374847279970609",
                    amountUsd: expect.stringContaining("393831107.68"),
                    price: "3181.09",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "60841657.140641",
                    amountUsd: expect.stringContaining("60780815.48"),
                    price: "0.999",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "135.63005559",
                    amountUsd: expect.stringContaining("8969079.94"),
                    price: "66129",
                    name: "Wrapped BTC",
                    symbol: "WBTC",
                    contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
                    type: "erc20",
                    decimals: 8,
                },
            ]);
            expect(mockEvmProviderService.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                        abi: erc20Abi,
                        functionName: "balanceOf",
                        args: [l1MetricsService["sharedBridgeAddress"]],
                    },
                    {
                        address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                        abi: erc20Abi,
                        functionName: "balanceOf",
                        args: [l1MetricsService["sharedBridgeAddress"]],
                    },
                    {
                        address: multicallAddress,
                        abi: multicall3Abi,
                        functionName: "getEthBalance",
                        args: [l1MetricsService["sharedBridgeAddress"]],
                    },
                ],
                allowFailure: false,
            });
            expect(mockPricingService.getTokenPrices).toHaveBeenCalledWith([
                "ethereum",
                "usd-coin",
                "wrapped-bitcoin",
            ]);
            expect(mockEvmProviderService.getBalance).not.toHaveBeenCalled();
        });

        it("return the TVL on L1 Shared Bridge without multicall", async () => {
            const mockPrices = { "wrapped-bitcoin": 66_129, "usd-coin": 0.999, ethereum: 3_181.09 }; // Mocked prices

            jest.spyOn(mockEvmProviderService, "getMulticall3Address").mockReturnValue(undefined);
            jest.spyOn(mockEvmProviderService, "multicall").mockRejectedValue(MulticallNotFound);
            jest.spyOn(mockEvmProviderService, "readContract")
                .mockResolvedValueOnce(60_841_657_140641n)
                .mockResolvedValueOnce(135_63005559n);
            jest.spyOn(mockEvmProviderService, "getBalance").mockResolvedValue(
                123_803_824374847279970609n,
            );
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1MetricsService.l1Tvl();

            expect(result).toHaveLength(3);
            expect(result).toEqual([
                {
                    amount: "123803.824374847279970609",
                    amountUsd: expect.stringContaining("393831107.68"),
                    price: "3181.09",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "60841657.140641",
                    amountUsd: expect.stringContaining("60780815.48"),
                    price: "0.999",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "135.63005559",
                    amountUsd: expect.stringContaining("8969079.94"),
                    price: "66129",
                    name: "Wrapped BTC",
                    symbol: "WBTC",
                    contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
                    type: "erc20",
                    decimals: 8,
                },
            ]);
            expect(mockEvmProviderService.multicall).not.toHaveBeenCalled();
            expect(mockEvmProviderService.readContract).toHaveBeenNthCalledWith(
                1,
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                erc20Abi,
                "balanceOf",
                [l1MetricsService["sharedBridgeAddress"]],
            );
            expect(mockEvmProviderService.readContract).toHaveBeenNthCalledWith(
                2,
                "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                erc20Abi,
                "balanceOf",
                [l1MetricsService["sharedBridgeAddress"]],
            );
            expect(mockEvmProviderService.getBalance).toHaveBeenCalledWith(
                l1MetricsService["sharedBridgeAddress"],
            );
            expect(mockPricingService.getTokenPrices).toHaveBeenCalledWith([
                "ethereum",
                "usd-coin",
                "wrapped-bitcoin",
            ]);
        });

        it("throws an error if the balances length is invalid", async () => {
            jest.spyOn(mockEvmProviderService, "getMulticall3Address").mockReturnValue("0x123452");
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue([]);

            await expect(l1MetricsService.l1Tvl()).rejects.toThrowError("Invalid balances length");
        });

        it("throws an error if the prices length is invalid", async () => {
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue([
                60_841_657_140641n,
                135_63005559n,
                123_803_824374847279970609n,
            ]);
            jest.spyOn(mockEvmProviderService, "getMulticall3Address").mockReturnValue("0x123452");
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue({
                ethereum: 3_181.09,
                "usd-coin": 0.999,
            });

            await expect(l1MetricsService.l1Tvl()).rejects.toThrowError("Invalid prices length");
        });
    });

    describe("getBatchesInfo", () => {
        it("returns batches info for chain id", async () => {
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1MetricsService["diamondContracts"].set(chainId, mockedDiamondProxyAddress);
            const mockBatchesInfo: BatchesInfo = { commited: 300n, verified: 200n, executed: 100n };
            const batchesInfoMulticallResponse = [
                mockBatchesInfo.commited,
                mockBatchesInfo.verified,
                mockBatchesInfo.executed,
            ];

            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue(
                batchesInfoMulticallResponse,
            );

            const result = await l1MetricsService.getBatchesInfo(chainId);

            expect(result).toEqual(mockBatchesInfo);
            expect(mockEvmProviderService.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesCommitted",
                        args: [],
                    },
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesVerified",
                        args: [],
                    },
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesExecuted",
                        args: [],
                    },
                ],
                allowFailure: false,
            });
        });

        it("throws if chainId doesn't exist on the ecosystem", async () => {
            const chainId = 324n; // this is ZKsyncEra chain id
            l1MetricsService["diamondContracts"].clear();
            jest.spyOn(mockEvmProviderService, "readContract").mockResolvedValue(zeroAddress);
            await expect(l1MetricsService.getBatchesInfo(chainId)).rejects.toThrow(InvalidChainId);
        });

        it("fetches and sets diamond proxy if chainId doesn't exists on map", async () => {
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1MetricsService["diamondContracts"].clear();

            const mockBatchesInfo: BatchesInfo = { commited: 300n, verified: 200n, executed: 100n };
            const batchesInfoMulticallResponse = [
                mockBatchesInfo.commited,
                mockBatchesInfo.verified,
                mockBatchesInfo.executed,
            ];

            jest.spyOn(mockEvmProviderService, "readContract").mockResolvedValue(
                mockedDiamondProxyAddress,
            );
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue(
                batchesInfoMulticallResponse,
            );
            const result = await l1MetricsService.getBatchesInfo(chainId);

            expect(result).toEqual(mockBatchesInfo);

            expect(l1MetricsService["diamondContracts"].get(chainId)).toEqual(
                mockedDiamondProxyAddress,
            );
            expect(mockEvmProviderService.readContract).toHaveBeenCalledWith(
                l1MetricsService["bridgeHubAddress"],
                bridgeHubAbi,
                "getHyperchain",
                [chainId],
            );
            expect(mockEvmProviderService.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesCommitted",
                        args: [],
                    },
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesVerified",
                        args: [],
                    },
                    {
                        address: mockedDiamondProxyAddress,
                        abi: diamondProxyAbi,
                        functionName: "getTotalBatchesExecuted",
                        args: [],
                    },
                ],
                allowFailure: false,
            });
        });
    });

    describe("fetchDiamondProxyAddress", () => {
        it("returns address if already exists in the map", async () => {
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";
            l1MetricsService["diamondContracts"].clear();
            l1MetricsService["diamondContracts"].set(chainId, mockedDiamondProxyAddress);

            const readContractSpy = jest.spyOn(mockEvmProviderService, "readContract");
            const result = await l1MetricsService["fetchDiamondProxyAddress"](chainId);

            expect(result).toEqual(mockedDiamondProxyAddress);
            expect(l1MetricsService["diamondContracts"].get(chainId)).toEqual(
                mockedDiamondProxyAddress,
            );
            expect(readContractSpy).toHaveBeenCalledTimes(0);
        });
        it("fetches and sets diamond proxy if chainId doesn't exists on map", async () => {
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1MetricsService["diamondContracts"].clear();

            jest.spyOn(mockEvmProviderService, "readContract").mockResolvedValue(
                mockedDiamondProxyAddress,
            );
            const result = await l1MetricsService["fetchDiamondProxyAddress"](chainId);

            expect(result).toEqual(mockedDiamondProxyAddress);

            expect(l1MetricsService["diamondContracts"].get(chainId)).toEqual(
                mockedDiamondProxyAddress,
            );
            expect(mockEvmProviderService.readContract).toHaveBeenCalledWith(
                l1MetricsService["bridgeHubAddress"],
                bridgeHubAbi,
                "getHyperchain",
                [chainId],
            );
        });
    });

    describe("tvl", () => {
        it("return the TVL for chain id", async () => {
            const mockBalances = [60_841_657_140641n, 135_63005559n, 123_803_824374847279970609n]; // Mocked balances
            const mockPrices = { "wrapped-bitcoin": 66_129, "usd-coin": 0.999, ethereum: 3_181.09 }; // Mocked prices
            const chainId = 324n; // this is ZKsyncEra chain id

            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue(mockBalances);
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue(mockPrices);

            const result = await l1MetricsService.tvl(chainId);

            expect(result).toHaveLength(3);
            expect(result).toEqual([
                {
                    amount: "123803.824374847279970609",
                    amountUsd: expect.stringContaining("393831107.68"),
                    price: "3181.09",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "60841657.140641",
                    amountUsd: expect.stringContaining("60780815.48"),
                    price: "0.999",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "135.63005559",
                    amountUsd: expect.stringContaining("8969079.94"),
                    price: "66129",
                    name: "Wrapped BTC",
                    symbol: "WBTC",
                    contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
                    type: "erc20",
                    decimals: 8,
                },
            ]);
            expect(mockEvmProviderService.multicall).toHaveBeenCalledWith({
                contracts: [
                    {
                        address: l1MetricsService["sharedBridgeAddress"],
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [chainId, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
                    },
                    {
                        address: l1MetricsService["sharedBridgeAddress"],
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [chainId, "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"],
                    },
                    {
                        address: l1MetricsService["sharedBridgeAddress"],
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [chainId, ETH_TOKEN_ADDRESS],
                    },
                ],
                allowFailure: false,
            });
            expect(mockPricingService.getTokenPrices).toHaveBeenCalledWith([
                "ethereum",
                "usd-coin",
                "wrapped-bitcoin",
            ]);
        });

        it("throws an error if the prices length is invalid", async () => {
            const chainId = 324n;
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue([
                60_841_657_140641n,
                135_63005559n,
                123_803_824374847279970609n,
            ]);
            jest.spyOn(mockPricingService, "getTokenPrices").mockResolvedValue({
                ethereum: 3_181.09,
                "usd-coin": 0.999,
            });

            await expect(l1MetricsService.tvl(chainId)).rejects.toThrowError(
                "Invalid prices length",
            );
        });
    });

    describe("chainType", () => {
        it("returns chainType", async () => {
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1MetricsService["diamondContracts"].set(chainId, mockedDiamondProxyAddress);
            const mockChainType: ChainType = "Rollup";

            const readContractSpy = jest
                .spyOn(mockEvmProviderService, "readContract")
                .mockResolvedValue(0);

            const result = await l1MetricsService.chainType(chainId);

            expect(result).toEqual(mockChainType);
            expect(readContractSpy).toHaveBeenCalledWith(
                mockedDiamondProxyAddress,
                diamondProxyAbi,
                "getPubdataPricingMode",
                [],
            );
        });
        it("returns chainType", async () => {
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1MetricsService["diamondContracts"].set(chainId, mockedDiamondProxyAddress);
            const mockChainType: ChainType = "Validium";

            const readContractSpy = jest
                .spyOn(mockEvmProviderService, "readContract")
                .mockResolvedValue(1);

            const result = await l1MetricsService.chainType(chainId);

            expect(result).toEqual(mockChainType);
            expect(readContractSpy).toHaveBeenCalledWith(
                mockedDiamondProxyAddress,
                diamondProxyAbi,
                "getPubdataPricingMode",
                [],
            );
        });
        it("throws if blockchain returns an out of bounds index", async () => {
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";

            l1MetricsService["diamondContracts"].set(chainId, mockedDiamondProxyAddress);

            jest.spyOn(mockEvmProviderService, "readContract").mockResolvedValue(100);

            await expect(l1MetricsService.chainType(chainId)).rejects.toThrowError(
                InvalidChainType,
            );
        });
    });

    describe("ethGasInfo", () => {
        it("returns gas information from L1", async () => {
            // Mock the necessary dependencies
            const mockEstimateGas = jest.spyOn(mockEvmProviderService, "estimateGas");
            mockEstimateGas.mockResolvedValueOnce(BigInt(21000)); // ethTransferGasCost
            mockEstimateGas.mockResolvedValueOnce(BigInt(65000)); // erc20TransferGasCost'
            const mockGetGasPrice = jest.spyOn(mockEvmProviderService, "getGasPrice");
            mockGetGasPrice.mockResolvedValueOnce(BigInt(50000000000)); // gasPrice

            const mockGetTokenPrices = jest.spyOn(mockPricingService, "getTokenPrices");
            mockGetTokenPrices.mockResolvedValueOnce({ [nativeToken.coingeckoId]: 2000 }); // ethPriceInUsd

            // Call the method
            const result = await l1MetricsService.ethGasInfo();

            // Assertions
            expect(mockEstimateGas).toHaveBeenCalledTimes(2);
            expect(mockEstimateGas).toHaveBeenNthCalledWith(1, {
                account: vitalikAddress,
                to: zeroAddress,
                value: ONE_ETHER,
            });
            expect(mockEstimateGas).toHaveBeenNthCalledWith(2, {
                account: vitalikAddress,
                to: WETH.contractAddress,
                data: encodeFunctionData({
                    abi: erc20Abi,
                    functionName: "transfer",
                    args: [l1MetricsService["sharedBridgeAddress"], ONE_ETHER],
                }),
            });

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);

            expect(mockGetTokenPrices).toHaveBeenCalledTimes(1);
            expect(mockGetTokenPrices).toHaveBeenCalledWith([nativeToken.coingeckoId]);

            expect(result).toEqual({
                gasPrice: 50000000000n,
                ethPrice: 2000,
                ethTransferGas: 21000n,
                erc20TransferGas: 65000n,
            });
        });

        it("returns gas information from L1 without ether price", async () => {
            const mockEstimateGas = jest.spyOn(mockEvmProviderService, "estimateGas");
            mockEstimateGas.mockResolvedValueOnce(BigInt(21000)); // ethTransferGasCost
            mockEstimateGas.mockResolvedValueOnce(BigInt(65000)); // erc20TransferGasCost

            const mockGetGasPrice = jest.spyOn(mockEvmProviderService, "getGasPrice");
            mockGetGasPrice.mockResolvedValueOnce(BigInt(50000000000)); // gasPrice

            const mockGetTokenPrices = jest.spyOn(mockPricingService, "getTokenPrices");
            mockGetTokenPrices.mockRejectedValueOnce(new Error("Failed to get token prices"));

            const result = await l1MetricsService.ethGasInfo();

            // Assertions
            expect(result).toEqual({
                gasPrice: 50000000000n,
                ethPrice: undefined,
                ethTransferGas: 21000n,
                erc20TransferGas: 65000n,
            });
            expect(mockEstimateGas).toHaveBeenCalledTimes(2);
            expect(mockEstimateGas).toHaveBeenNthCalledWith(1, {
                account: vitalikAddress,
                to: zeroAddress,
                value: ONE_ETHER,
            });
            expect(mockEstimateGas).toHaveBeenNthCalledWith(2, {
                account: vitalikAddress,
                to: WETH.contractAddress,
                data: encodeFunctionData({
                    abi: erc20Abi,
                    functionName: "transfer",
                    args: [l1MetricsService["sharedBridgeAddress"], ONE_ETHER],
                }),
            });

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);

            expect(mockGetTokenPrices).toHaveBeenCalledTimes(1);
            expect(mockGetTokenPrices).toHaveBeenCalledWith([nativeToken.coingeckoId]);
        });

        it("throws L1MetricsServiceException when estimateGas fails", async () => {
            // Mock the necessary dependencies
            const mockEstimateGas = jest.spyOn(mockEvmProviderService, "estimateGas");
            mockEstimateGas.mockRejectedValueOnce(new Error("Failed to estimate gas"));

            const mockGetGasPrice = jest.spyOn(mockEvmProviderService, "getGasPrice");
            mockGetGasPrice.mockResolvedValueOnce(BigInt(50000000000)); // gasPrice

            const mockGetTokenPrices = jest.spyOn(mockPricingService, "getTokenPrices");
            mockGetTokenPrices.mockResolvedValueOnce({ [nativeToken.coingeckoId]: 2000 }); // ethPriceInUsd

            // Call the method and expect it to throw L1MetricsServiceException
            await expect(l1MetricsService.ethGasInfo()).rejects.toThrow(L1MetricsServiceException);

            // Assertions
            expect(mockEstimateGas).toHaveBeenCalledWith({
                account: vitalikAddress,
                to: zeroAddress,
                value: ONE_ETHER,
            });

            expect(mockGetTokenPrices).not.toHaveBeenCalled();
        });

        it("throws L1MetricsServiceException when getGasPrice fails", async () => {
            // Mock the necessary dependencies
            const mockEstimateGas = jest.spyOn(mockEvmProviderService, "estimateGas");
            mockEstimateGas.mockResolvedValueOnce(BigInt(21000)); // ethTransferGasCost
            mockEstimateGas.mockResolvedValueOnce(BigInt(65000)); // erc20TransferGasCost

            const mockGetGasPrice = jest.spyOn(mockEvmProviderService, "getGasPrice");
            mockGetGasPrice.mockRejectedValueOnce(new Error("Failed to get gas price"));

            const mockGetTokenPrices = jest.spyOn(mockPricingService, "getTokenPrices");
            mockGetTokenPrices.mockResolvedValueOnce({ [nativeToken.coingeckoId]: 2000 }); // ethPriceInUsd

            // Call the method and expect it to throw L1MetricsServiceException
            await expect(l1MetricsService.ethGasInfo()).rejects.toThrow(L1MetricsServiceException);

            // Assertions
            expect(mockEstimateGas).toHaveBeenCalledTimes(2);
            expect(mockEstimateGas).toHaveBeenNthCalledWith(1, {
                account: vitalikAddress,
                to: zeroAddress,
                value: ONE_ETHER,
            });
            expect(mockEstimateGas).toHaveBeenNthCalledWith(2, {
                account: vitalikAddress,
                to: WETH.contractAddress,
                data: encodeFunctionData({
                    abi: erc20Abi,
                    functionName: "transfer",
                    args: [l1MetricsService["sharedBridgeAddress"], ONE_ETHER],
                }),
            });

            expect(mockGetGasPrice).toHaveBeenCalledTimes(1);

            expect(mockGetTokenPrices).not.toHaveBeenCalled();
        });
    });

    describe("getChainIds", () => {
        it("returns chainIds", async () => {
            true && true;
            l1MetricsService = await mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            const mockedMulticallReturnValue = [
                [1n, 2n, 3n],
                [4n, 5n, 6n],
            ];
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue(
                mockedMulticallReturnValue,
            );

            const result = await l1MetricsService.getChainIds();

            expect(result).toEqual(mockedMulticallReturnValue.flat());
            expect(l1MetricsService["chainIds"]).toEqual(mockedMulticallReturnValue.flat());
        });
        it("returns chainIds previously setted up", async () => {
            const mockedChainIds = [1n, 2n, 3n, 4n, 5n];
            l1MetricsService = await mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            l1MetricsService["chainIds"] = mockedChainIds;

            const result = await l1MetricsService.getChainIds();

            expect(result).toEqual(mockedChainIds);
        });
        it("returns empty array if chainIds are empty", async () => {
            const mockedChainIds: bigint[] = [];
            l1MetricsService = await mockMetricsModule(
                mockedBridgeHubAddress,
                mockedSharedBridgeAddress,
                mockedSTMAddresses,
            );
            l1MetricsService["chainIds"] = mockedChainIds;

            const result = await l1MetricsService.getChainIds();

            expect(result).toEqual(mockedChainIds);
        });
        it("throws if multicall throws", async () => {
            jest.spyOn(mockEvmProviderService, "multicall").mockRejectedValue(new Error());
            await expect(l1MetricsService.getChainIds()).rejects.toThrow(Error);
        });
    });

    describe("getBaseTokens", () => {
        it("returns known tokens", async () => {
            const mockedChainIds = [1n, 2n];
            const knownTokenAddress1 = Object.keys(erc20Tokens)[0];
            const knownTokenAddress2 = Object.keys(erc20Tokens)[0];

            if (!knownTokenAddress1 || !knownTokenAddress2) {
                throw new Error("ERC20 tokens are not defined");
            }
            const mockedMulticallReturnValue = [knownTokenAddress1, knownTokenAddress2];
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue(
                mockedMulticallReturnValue,
            );
            const mockedReturnData: Token<TokenType>[] = [
                erc20Tokens[knownTokenAddress1 as Address] as Token<"erc20">,
                erc20Tokens[knownTokenAddress2 as Address] as Token<"erc20">,
            ];

            const result = await l1MetricsService.getBaseTokens(mockedChainIds);

            expect(result).toEqual(mockedReturnData);
        });

        it("returns unknown tokens", async () => {
            const mockedChainIds = [1n, 2n];
            const mockedMulticallReturnValue = [
                "0x1234567890123456789012345678901234567123",
                "0x1234567890123456789012345678901234567345",
            ];
            jest.spyOn(mockEvmProviderService, "multicall").mockResolvedValue(
                mockedMulticallReturnValue,
            );
            const mockedReturnData: Token<TokenType>[] = [
                {
                    contractAddress: "0x1234567890123456789012345678901234567123",
                    symbol: "unknown",
                    name: "unknown",
                    decimals: 18,
                    type: "erc20",
                    coingeckoId: "unknown",
                },
                {
                    contractAddress: "0x1234567890123456789012345678901234567345",
                    symbol: "unknown",
                    name: "unknown",
                    decimals: 18,
                    type: "erc20",
                    coingeckoId: "unknown",
                },
            ];

            const result = await l1MetricsService.getBaseTokens(mockedChainIds);

            expect(result).toEqual(mockedReturnData);
        });
        it("returns empty array if chainIds is empty", async () => {
            const mockedChainIds: ChainId[] = [];
            const result = await l1MetricsService.getBaseTokens(mockedChainIds);
            expect(result).toEqual([]);
        });
        it("throws if multicall fails", async () => {
            const mockedChainIds: ChainId[] = [1n, 2n];
            jest.spyOn(mockEvmProviderService, "multicall").mockRejectedValue(new Error());
            await expect(l1MetricsService.getBaseTokens(mockedChainIds)).rejects.toThrow(Error);
        });
        it("returns eth token", async () => {
            const mockedChainIds: ChainId[] = [1n, 2n];
            jest.spyOn(mockEvmProviderService, "multicall").mockRejectedValue(new Error());
            await expect(l1MetricsService.getBaseTokens(mockedChainIds)).rejects.toThrow(Error);
        });
    });

    describe("feeParams", () => {
        it("should retrieve the fee parameters for a specific chain", async () => {
            // Mock the dependencies
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";
            const mockFeeParamsRawData =
                "0x00000000000000000000000ee6b280000182b804c4b4000001d4c0000f424000";

            const mockFeeParams = {
                pubdataPricingMode: 0,
                batchOverheadL1Gas: 1000000,
                maxPubdataPerBatch: 120000,
                maxL2GasPerBatch: 80000000,
                priorityTxMaxPubdata: 99000,
                minimalL2GasPrice: 250000000n,
            };

            l1MetricsService["diamondContracts"].set(chainId, mockedDiamondProxyAddress);
            jest.spyOn(mockEvmProviderService, "getStorageAt").mockResolvedValue(
                mockFeeParamsRawData,
            );

            const result = await l1MetricsService.feeParams(chainId);

            expect(mockEvmProviderService.getStorageAt).toHaveBeenCalledWith(
                mockedDiamondProxyAddress,
                `0x26`,
            );

            expect(result).toEqual(mockFeeParams);
        });

        it("should throw an exception if the fee parameters cannot be retrieved from L1", async () => {
            // Mock the dependencies
            const chainId = 324n; // this is ZKsyncEra chain id
            const mockedDiamondProxyAddress = "0x1234567890123456789012345678901234567890";
            l1MetricsService["diamondContracts"].set(chainId, mockedDiamondProxyAddress);

            jest.spyOn(mockEvmProviderService, "getStorageAt").mockResolvedValue(undefined);

            await expect(l1MetricsService.feeParams(chainId)).rejects.toThrow(
                L1MetricsServiceException,
            );
        });
    });
});
