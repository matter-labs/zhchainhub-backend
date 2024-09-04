import BigNumber from "bignumber.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IMetadataProvider } from "@zkchainhub/metadata";
import { AssetTvl, GasInfo, L1MetricsService, L2MetricsService } from "@zkchainhub/metrics";
import {
    ChainId,
    ChainType,
    ILogger,
    nativeToken,
    Token,
    ZKChainMetadataItem,
} from "@zkchainhub/shared";

import { MetricsController } from "../../../src/metrics/controllers";
import {
    EcosystemInfo,
    ZKChainInfo,
    ZkChainMetadata,
    ZKChainSummary,
} from "../../../src/metrics/dto/response";
import { ChainNotFound } from "../../../src/metrics/exceptions";

const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

describe("MetricsController", () => {
    let service: MetricsController;
    let l1MetricsService: L1MetricsService;
    let l2MetricsMap: Map<ChainId, L2MetricsService>;
    let metadataProvider: IMetadataProvider;

    afterEach(() => {
        vi.restoreAllMocks();
    });

    beforeEach(async () => {
        l1MetricsService = {
            l1Tvl: vi.fn(),
            getBatchesInfo: vi.fn(),
            ethGasInfo: vi.fn(),
            getChainIds: vi.fn(),
            tvl: vi.fn(),
            getBaseTokens: vi.fn(),
            chainType: vi.fn(),
            feeParams: vi.fn(),
        } as unknown as L1MetricsService;
        metadataProvider = {
            getChainsMetadata: vi.fn(),
            getTokensMetadata: vi.fn(),
        };
        l2MetricsMap = new Map<ChainId, L2MetricsService>();
        service = new MetricsController(
            l1MetricsService,
            l2MetricsMap,
            metadataProvider,
            mockLogger,
        );
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(l1MetricsService).toBeDefined();
    });

    describe("getEcosystem", () => {
        it("returns the ecosystem information", async () => {
            const zkChainsMetadata = new Map<bigint, ZKChainMetadataItem>();
            zkChainsMetadata.set(324n, {
                chainId: 324n,
                chainType: "Rollup",
                baseToken: nativeToken,
                iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
                name: "ZKsyncERA",
                publicRpcs: [
                    "https://mainnet.era.zksync.io",
                    "https://zksync.drpc.org",
                    "https://zksync.meowrpc.com",
                ],
                explorerUrl: "https://explorer.zksync.io/",
                launchDate: 1679626800,
            });
            zkChainsMetadata.set(388n, {
                chainId: 388n,
                chainType: "Rollup",
                baseToken: {
                    symbol: "zkCRO",
                    name: "zkCRO",
                    contractAddress: "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2",
                    type: "erc20",
                    imageUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
                    decimals: 18,
                },
                iconUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
                name: "Cronos",
                publicRpcs: ["https://mainnet.zkevm.cronos.org"],
                explorerUrl: "https://explorer.zkevm.cronos.org/",
                launchDate: 1679626800,
            });
            const mockChainIds: ChainId[] = [324n, 388n];
            const mockL1Tvl: AssetTvl[] = [
                {
                    amount: "118306.55998740125385395",
                    amountUsd: "300833115.01308356813367811665",
                    price: "2542.827",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "56310048.030096",
                    amountUsd: "56366358.078126096",
                    price: "1.001",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "998459864.823799773445941598",
                    amountUsd: "11981518.377885597281351299176",
                    price: "0.012",
                    name: "Koi",
                    symbol: "KOI",
                    contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
                    type: "erc20",
                    decimals: 18,
                },
            ];
            const mockZkTvl: AssetTvl[] = [
                {
                    amount: "118306.55998740125385395",
                    amountUsd: "300833115.01308356813367811665",
                    price: "2542.827",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "56310048.030096",
                    amountUsd: "56366358.078126096",
                    price: "1.001",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "998459864.823799773445941598",
                    amountUsd: "11981518.377885597281351299176",
                    price: "0.012",
                    name: "Koi",
                    symbol: "KOI",
                    contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
                    type: "erc20",
                    decimals: 18,
                },
            ];
            const mockGasInfo: GasInfo = {
                gasPrice: 2805208450n,
                erc20Transfer: 34853n,
                ethTransfer: 21000n,
            };

            vi.spyOn(metadataProvider, "getChainsMetadata").mockResolvedValue(zkChainsMetadata);
            vi.spyOn(l1MetricsService, "l1Tvl").mockResolvedValue(mockL1Tvl);
            vi.spyOn(l1MetricsService, "ethGasInfo").mockResolvedValue(mockGasInfo);
            vi.spyOn(l1MetricsService, "getChainIds").mockResolvedValue(mockChainIds);
            vi.spyOn(l1MetricsService, "tvl")
                .mockResolvedValueOnce(mockZkTvl)
                .mockResolvedValueOnce(mockZkTvl);
            vi.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([
                nativeToken,
                nativeToken,
            ]);
            vi.spyOn(l1MetricsService, "chainType").mockResolvedValue("Rollup");
            if (
                !mockChainIds[0] ||
                !mockChainIds[1] ||
                !zkChainsMetadata.get(mockChainIds[0]) ||
                !zkChainsMetadata.get(mockChainIds[1])
            ) {
                throw new Error("Chain ID not defined");
            }
            const mockZkChains = [
                {
                    chainId: mockChainIds[0].toString(),
                    chainType: zkChainsMetadata.get(mockChainIds[0])?.chainType as ChainType,
                    baseToken: zkChainsMetadata.get(mockChainIds[0])?.baseToken as Token<
                        "erc20" | "native"
                    >,
                    tvl: mockZkTvl
                        .reduce((acc, curr) => {
                            return acc.plus(BigNumber(curr.amountUsd || 0));
                        }, new BigNumber(0))
                        .toString(),
                    metadata: new ZkChainMetadata(
                        zkChainsMetadata.get(mockChainIds[0]) as ZkChainMetadata,
                    ),
                    rpc: false,
                },
                {
                    chainId: mockChainIds[1].toString(),
                    chainType: zkChainsMetadata.get(mockChainIds[1])?.chainType as ChainType,
                    baseToken: zkChainsMetadata.get(mockChainIds[1])?.baseToken as Token<
                        "erc20" | "native"
                    >,
                    tvl: mockZkTvl
                        .reduce((acc, curr) => {
                            return acc.plus(BigNumber(curr.amountUsd || 0));
                        }, new BigNumber(0))
                        .toString(),
                    metadata: new ZkChainMetadata(
                        zkChainsMetadata.get(mockChainIds[1] as bigint) as ZkChainMetadata,
                    ),
                    rpc: false,
                },
            ];
            const result = await service.getEcosystem();

            expect(result).toEqual(
                new EcosystemInfo({
                    l1Tvl: mockL1Tvl,
                    ethGasInfo: {
                        gasPrice: mockGasInfo.gasPrice.toString(),
                        erc20Transfer: mockGasInfo.erc20Transfer.toString(),
                        ethTransfer: mockGasInfo.ethTransfer.toString(),
                    },
                    zkChains: mockZkChains,
                }),
            );
            expect(l1MetricsService.l1Tvl).toHaveBeenCalled();
            expect(l1MetricsService.ethGasInfo).toHaveBeenCalled();
            expect(l1MetricsService.getChainIds).toHaveBeenCalled();
            expect(l1MetricsService.tvl).toHaveBeenCalledTimes(2);
        });
        it("returns the ecosystem without using metadata", async () => {
            const zkChainsMetadata = new Map<bigint, ZKChainMetadataItem>();
            zkChainsMetadata.set(388n, {
                chainId: 388n,
                chainType: "Rollup",
                baseToken: {
                    symbol: "zkCRO",
                    name: "zkCRO",
                    contractAddress: "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2",
                    type: "erc20",
                    imageUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
                    decimals: 18,
                },
                iconUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
                name: "Cronos",
                publicRpcs: ["https://mainnet.zkevm.cronos.org"],
                explorerUrl: "https://explorer.zkevm.cronos.org/",
                launchDate: 1679626800,
            });
            const mockChainIds: ChainId[] = [324n, 388n];
            const mockL1Tvl: AssetTvl[] = [
                {
                    amount: "118306.55998740125385395",
                    amountUsd: "300833115.01308356813367811665",
                    price: "2542.827",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "56310048.030096",
                    amountUsd: "56366358.078126096",
                    price: "1.001",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "998459864.823799773445941598",
                    amountUsd: "11981518.377885597281351299176",
                    price: "0.012",
                    name: "Koi",
                    symbol: "KOI",
                    contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
                    type: "erc20",
                    decimals: 18,
                },
            ];
            const mockZkTvl: AssetTvl[] = [
                {
                    amount: "118306.55998740125385395",
                    amountUsd: "300833115.01308356813367811665",
                    price: "2542.827",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "56310048.030096",
                    amountUsd: "56366358.078126096",
                    price: "1.001",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "998459864.823799773445941598",
                    amountUsd: "11981518.377885597281351299176",
                    price: "0.012",
                    name: "Koi",
                    symbol: "KOI",
                    contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
                    type: "erc20",
                    decimals: 18,
                },
            ];
            const mockGasInfo: GasInfo = {
                gasPrice: 2805208450n,
                erc20Transfer: 34853n,
                ethTransfer: 21000n,
            };
            const mockedChainType = "Rollup";

            vi.spyOn(metadataProvider, "getChainsMetadata").mockResolvedValue(zkChainsMetadata);
            vi.spyOn(l1MetricsService, "l1Tvl").mockResolvedValue(mockL1Tvl);
            vi.spyOn(l1MetricsService, "ethGasInfo").mockResolvedValue(mockGasInfo);
            vi.spyOn(l1MetricsService, "getChainIds").mockResolvedValue(mockChainIds);
            vi.spyOn(l1MetricsService, "tvl")
                .mockResolvedValueOnce(mockZkTvl)
                .mockResolvedValueOnce(mockZkTvl);
            vi.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([
                nativeToken,
                nativeToken,
            ]);
            vi.spyOn(l1MetricsService, "chainType").mockResolvedValue(mockedChainType);

            if (!mockChainIds[0] || !mockChainIds[1]) {
                throw new Error("Chain ID not defined");
            }
            const mockZkChains = [
                {
                    chainId: mockChainIds[0].toString(),
                    chainType: mockedChainType as ChainType,
                    baseToken: nativeToken,
                    tvl: mockZkTvl
                        .reduce((acc, curr) => {
                            return acc.plus(BigNumber(curr.amountUsd || 0));
                        }, new BigNumber(0))
                        .toString(),
                    rpc: false,
                },
                {
                    chainId: mockChainIds[1].toString(),
                    chainType: zkChainsMetadata.get(mockChainIds[1])?.chainType as ChainType,
                    baseToken: zkChainsMetadata.get(mockChainIds[1])?.baseToken as Token<
                        "erc20" | "native"
                    >,
                    tvl: mockZkTvl
                        .reduce((acc, curr) => {
                            return acc.plus(BigNumber(curr.amountUsd || 0));
                        }, new BigNumber(0))
                        .toString(),
                    metadata: new ZkChainMetadata(
                        zkChainsMetadata.get(mockChainIds[1] as bigint) as ZkChainMetadata,
                    ),
                    rpc: false,
                },
            ];
            const result = await service.getEcosystem();

            expect(result).toEqual(
                new EcosystemInfo({
                    l1Tvl: mockL1Tvl,
                    ethGasInfo: {
                        gasPrice: mockGasInfo.gasPrice.toString(),
                        erc20Transfer: mockGasInfo.erc20Transfer.toString(),
                        ethTransfer: mockGasInfo.ethTransfer.toString(),
                    },
                    zkChains: mockZkChains,
                }),
            );
            expect(l1MetricsService.l1Tvl).toHaveBeenCalled();
            expect(l1MetricsService.ethGasInfo).toHaveBeenCalled();
            expect(l1MetricsService.getChainIds).toHaveBeenCalled();
            expect(l1MetricsService.tvl).toHaveBeenCalledTimes(2);
        });
        it("returns the ecosystem information with empty zkChains if there are no zkChains", async () => {
            const mockChainIds: ChainId[] = [];
            const mockL1Tvl: AssetTvl[] = [
                {
                    amount: "118306.55998740125385395",
                    amountUsd: "300833115.01308356813367811665",
                    price: "2542.827",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "56310048.030096",
                    amountUsd: "56366358.078126096",
                    price: "1.001",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "998459864.823799773445941598",
                    amountUsd: "11981518.377885597281351299176",
                    price: "0.012",
                    name: "Koi",
                    symbol: "KOI",
                    contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
                    type: "erc20",
                    decimals: 18,
                },
            ];
            const mockGasInfo: GasInfo = {
                gasPrice: 2805208450n,
                erc20Transfer: 34853n,
                ethTransfer: 21000n,
            };

            vi.spyOn(metadataProvider, "getChainsMetadata").mockResolvedValue(new Map());
            vi.spyOn(l1MetricsService, "l1Tvl").mockResolvedValue(mockL1Tvl);
            vi.spyOn(l1MetricsService, "ethGasInfo").mockResolvedValue(mockGasInfo);
            vi.spyOn(l1MetricsService, "getChainIds").mockResolvedValue(mockChainIds);
            const mockZkChains: ZKChainSummary[] = [];
            const result = await service.getEcosystem();
            expect(result).toEqual(
                new EcosystemInfo({
                    l1Tvl: mockL1Tvl,
                    ethGasInfo: {
                        gasPrice: mockGasInfo.gasPrice.toString(),
                        erc20Transfer: mockGasInfo.erc20Transfer.toString(),
                        ethTransfer: mockGasInfo.ethTransfer.toString(),
                    },
                    zkChains: mockZkChains,
                }),
            );
            expect(l1MetricsService.l1Tvl).toHaveBeenCalled();
            expect(l1MetricsService.ethGasInfo).toHaveBeenCalled();
            expect(l1MetricsService.getChainIds).toHaveBeenCalled();
        });
        it("throws if some l1Service call throws ", async () => {
            vi.spyOn(l1MetricsService, "l1Tvl").mockRejectedValue(new Error("l1Tvl error"));

            await expect(service.getEcosystem()).rejects.toThrow("l1Tvl error");
            expect(l1MetricsService.l1Tvl).toHaveBeenCalled();
            expect(l1MetricsService.ethGasInfo).toHaveBeenCalled();
            expect(l1MetricsService.getChainIds).toHaveBeenCalled();
        });
    });

    describe("getChain", () => {
        it("returns the chain information for the specified chain ID", async () => {
            const chainId = 324;
            const chainIdBn = BigInt(chainId);
            const mockZkTvl: AssetTvl[] = [
                {
                    amount: "118306.55998740125385395",
                    amountUsd: "300833115.01308356813367811665",
                    price: "2542.827",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "56310048.030096",
                    amountUsd: "56366358.078126096",
                    price: "1.001",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "998459864.823799773445941598",
                    amountUsd: "11981518.377885597281351299176",
                    price: "0.012",
                    name: "Koi",
                    symbol: "KOI",
                    contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
                    type: "erc20",
                    decimals: 18,
                },
            ];
            const mockBatchesInfo = { commited: 1n, verified: 1n, executed: 1n };
            const mockFeeParams = {
                pubdataPricingMode: 1,
                batchOverheadL1Gas: 50000,
                maxL2GasPerBatch: 100000,
                maxPubdataPerBatch: 8000,
                minimalL2GasPrice: 2000000000n,
                priorityTxMaxPubdata: 1000,
            };
            const zkChainsMetadata = new Map<bigint, ZKChainMetadataItem>();
            zkChainsMetadata.set(chainIdBn, {
                chainId: 324n,
                chainType: "Rollup",
                baseToken: nativeToken,
                iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
                name: "ZKsyncERA",
                publicRpcs: [
                    "https://mainnet.era.zksync.io",
                    "https://zksync.drpc.org",
                    "https://zksync.meowrpc.com",
                ],
                explorerUrl: "https://explorer.zksync.io/",
                launchDate: 1679626800,
            });

            vi.spyOn(metadataProvider, "getChainsMetadata").mockResolvedValue(zkChainsMetadata);
            vi.spyOn(l1MetricsService, "getChainIds").mockResolvedValue([chainIdBn]);
            vi.spyOn(l1MetricsService, "tvl").mockResolvedValue(mockZkTvl);
            vi.spyOn(l1MetricsService, "getBatchesInfo").mockResolvedValue(mockBatchesInfo);
            vi.spyOn(l1MetricsService, "feeParams").mockResolvedValue(mockFeeParams);
            vi.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([nativeToken]);

            const result = await service.getChain(chainId);

            expect(result).toEqual(
                new ZKChainInfo({
                    batchesInfo: {
                        commited: mockBatchesInfo.commited.toString(),
                        verified: mockBatchesInfo.verified.toString(),
                        executed: mockBatchesInfo.executed.toString(),
                    },
                    tvl: mockZkTvl,
                    feeParams: {
                        batchOverheadL1Gas: mockFeeParams.batchOverheadL1Gas,
                        maxL2GasPerBatch: mockFeeParams.maxL2GasPerBatch,
                        maxPubdataPerBatch: mockFeeParams.maxPubdataPerBatch,
                        minimalL2GasPrice: mockFeeParams.minimalL2GasPrice.toString(),
                        priorityTxMaxPubdata: mockFeeParams.priorityTxMaxPubdata,
                    },
                    chainType: zkChainsMetadata.get(chainIdBn)?.chainType as ChainType,
                    baseToken: zkChainsMetadata.get(chainIdBn)?.baseToken as Token<
                        "erc20" | "native"
                    >,
                    metadata: new ZkChainMetadata(
                        zkChainsMetadata.get(chainIdBn) as ZkChainMetadata,
                    ),
                }),
            );
        });

        it("returns the chain information without metadata", async () => {
            const chainId = 324;
            const chainIdBn = BigInt(chainId);
            const mockZkTvl: AssetTvl[] = [
                {
                    amount: "118306.55998740125385395",
                    amountUsd: "300833115.01308356813367811665",
                    price: "2542.827",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "56310048.030096",
                    amountUsd: "56366358.078126096",
                    price: "1.001",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "998459864.823799773445941598",
                    amountUsd: "11981518.377885597281351299176",
                    price: "0.012",
                    name: "Koi",
                    symbol: "KOI",
                    contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
                    type: "erc20",
                    decimals: 18,
                },
            ];
            const mockBatchesInfo = { commited: 1n, verified: 1n, executed: 1n };
            const mockFeeParams = {
                pubdataPricingMode: 1,
                batchOverheadL1Gas: 50000,
                maxL2GasPerBatch: 100000,
                maxPubdataPerBatch: 8000,
                minimalL2GasPrice: 2000000000n,
                priorityTxMaxPubdata: 1000,
            };
            const mockedChainType = "Rollup";

            vi.spyOn(metadataProvider, "getChainsMetadata").mockResolvedValue(new Map());
            vi.spyOn(l1MetricsService, "getChainIds").mockResolvedValue([chainIdBn]);
            vi.spyOn(l1MetricsService, "tvl").mockResolvedValue(mockZkTvl);
            vi.spyOn(l1MetricsService, "getBatchesInfo").mockResolvedValue(mockBatchesInfo);
            vi.spyOn(l1MetricsService, "feeParams").mockResolvedValue(mockFeeParams);
            vi.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([nativeToken]);
            vi.spyOn(l1MetricsService, "chainType").mockResolvedValue(mockedChainType);

            const result = await service.getChain(chainId);

            expect(result).toEqual(
                new ZKChainInfo({
                    batchesInfo: {
                        commited: mockBatchesInfo.commited.toString(),
                        verified: mockBatchesInfo.verified.toString(),
                        executed: mockBatchesInfo.executed.toString(),
                    },
                    tvl: mockZkTvl,
                    feeParams: {
                        batchOverheadL1Gas: mockFeeParams.batchOverheadL1Gas,
                        maxL2GasPerBatch: mockFeeParams.maxL2GasPerBatch,
                        maxPubdataPerBatch: mockFeeParams.maxPubdataPerBatch,
                        minimalL2GasPrice: mockFeeParams.minimalL2GasPrice.toString(),
                        priorityTxMaxPubdata: mockFeeParams.priorityTxMaxPubdata,
                    },
                    chainType: mockedChainType as ChainType,
                    baseToken: nativeToken,
                }),
            );
        });

        it("returns the chain information with L2 Metrics for the specified chain ID", async () => {
            const l2MetricsService = {
                tps: vi.fn(),
                avgBlockTime: vi.fn(),
                lastBlock: vi.fn(),
                getLastVerifiedBlock: vi.fn(),
            } as unknown as L2MetricsService;
            l2MetricsMap.set(324n, l2MetricsService);

            const chainId = 324;
            const chainIdBn = BigInt(chainId);
            const mockZkTvl: AssetTvl[] = [
                {
                    amount: "118306.55998740125385395",
                    amountUsd: "300833115.01308356813367811665",
                    price: "2542.827",
                    name: "Ethereum",
                    symbol: "ETH",
                    contractAddress: null,
                    type: "native",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
                    decimals: 18,
                },
                {
                    amount: "56310048.030096",
                    amountUsd: "56366358.078126096",
                    price: "1.001",
                    name: "USDC",
                    symbol: "USDC",
                    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
                    type: "erc20",
                    decimals: 6,
                },
                {
                    amount: "998459864.823799773445941598",
                    amountUsd: "11981518.377885597281351299176",
                    price: "0.012",
                    name: "Koi",
                    symbol: "KOI",
                    contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
                    imageUrl:
                        "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
                    type: "erc20",
                    decimals: 18,
                },
            ];
            const mockBatchesInfo = { commited: 1n, verified: 1n, executed: 1n };
            const mockFeeParams = {
                pubdataPricingMode: 1,
                batchOverheadL1Gas: 50000,
                maxL2GasPerBatch: 100000,
                maxPubdataPerBatch: 8000,
                minimalL2GasPrice: 2000000000n,
                priorityTxMaxPubdata: 1000,
            };
            const zkChainsMetadata = new Map<bigint, ZKChainMetadataItem>();
            zkChainsMetadata.set(chainIdBn, {
                chainId: 324n,
                chainType: "Rollup",
                baseToken: nativeToken,
                iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
                name: "ZKsyncERA",
                publicRpcs: [
                    "https://mainnet.era.zksync.io",
                    "https://zksync.drpc.org",
                    "https://zksync.meowrpc.com",
                ],
                explorerUrl: "https://explorer.zksync.io/",
                launchDate: 1679626800,
            });

            vi.spyOn(metadataProvider, "getChainsMetadata").mockResolvedValue(zkChainsMetadata);
            vi.spyOn(l1MetricsService, "getChainIds").mockResolvedValue([chainIdBn]);
            vi.spyOn(l1MetricsService, "tvl").mockResolvedValue(mockZkTvl);
            vi.spyOn(l1MetricsService, "getBatchesInfo").mockResolvedValue(mockBatchesInfo);
            vi.spyOn(l1MetricsService, "feeParams").mockResolvedValue(mockFeeParams);
            vi.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([nativeToken]);
            vi.spyOn(l2MetricsService, "tps").mockResolvedValue(1.5);
            vi.spyOn(l2MetricsService, "avgBlockTime").mockResolvedValue(10.5);
            vi.spyOn(l2MetricsService, "lastBlock").mockResolvedValue(5000n);
            vi.spyOn(l2MetricsService, "getLastVerifiedBlock").mockResolvedValue(4950);

            const result = await service.getChain(chainId);

            expect(result).toEqual(
                new ZKChainInfo({
                    batchesInfo: {
                        commited: mockBatchesInfo.commited.toString(),
                        verified: mockBatchesInfo.verified.toString(),
                        executed: mockBatchesInfo.executed.toString(),
                    },
                    tvl: mockZkTvl,
                    feeParams: {
                        batchOverheadL1Gas: mockFeeParams.batchOverheadL1Gas,
                        maxL2GasPerBatch: mockFeeParams.maxL2GasPerBatch,
                        maxPubdataPerBatch: mockFeeParams.maxPubdataPerBatch,
                        minimalL2GasPrice: mockFeeParams.minimalL2GasPrice.toString(),
                        priorityTxMaxPubdata: mockFeeParams.priorityTxMaxPubdata,
                    },
                    chainType: zkChainsMetadata.get(chainIdBn)?.chainType as ChainType,
                    baseToken: zkChainsMetadata.get(chainIdBn)?.baseToken as Token<
                        "erc20" | "native"
                    >,
                    metadata: new ZkChainMetadata(
                        zkChainsMetadata.get(chainIdBn) as ZkChainMetadata,
                    ),
                    l2ChainInfo: {
                        tps: 1.5,
                        avgBlockTime: 10.5,
                        lastBlock: "5000",
                        lastBlockVerified: 4950,
                    },
                }),
            );
            expect(l2MetricsService.getLastVerifiedBlock).toHaveBeenCalledWith(1);
        });

        it("should throw ChainNotFound exception when chain ID is not found", async () => {
            const chainId = 999;
            vi.spyOn(metadataProvider, "getChainsMetadata").mockResolvedValue(new Map());
            vi.spyOn(l1MetricsService, "getChainIds").mockResolvedValue([]);

            await expect(service.getChain(chainId)).rejects.toThrow(ChainNotFound);
        });
    });
});
