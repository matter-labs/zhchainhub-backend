import { createMock } from "@golevelup/ts-jest";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import BigNumber from "bignumber.js";

import { L1MetricsService } from "@zkchainhub/metrics/l1";
import { AssetTvl, GasInfo } from "@zkchainhub/metrics/types";
import { ChainId, ChainType, nativeToken, Token, zkChainsMetadata } from "@zkchainhub/shared";

import {
    EcosystemInfo,
    ZKChainInfo,
    ZkChainMetadata,
    ZKChainSummary,
} from "../../../src/metrics/dto/response";
import { ChainNotFound } from "../../../src/metrics/exceptions";
import { MetricsController } from "../../../src/metrics/metrics.controller";

const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

describe("MetricsController", () => {
    let controller: MetricsController;
    let l1MetricsService: L1MetricsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: Logger,
                    useValue: mockLogger,
                },
                {
                    provide: L1MetricsService,
                    useValue: createMock<L1MetricsService>(),
                },
            ],
            controllers: [MetricsController],
        }).compile();

        controller = module.get<MetricsController>(MetricsController);
        l1MetricsService = module.get<L1MetricsService>(L1MetricsService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
        expect(l1MetricsService).toBeDefined();
    });

    describe("getEcosystem", () => {
        it("returns the ecosystem information", async () => {
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
                    coingeckoId: "unknown",
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

            jest.spyOn(l1MetricsService, "l1Tvl").mockResolvedValue(mockL1Tvl);
            jest.spyOn(l1MetricsService, "ethGasInfo").mockResolvedValue(mockGasInfo);
            jest.spyOn(l1MetricsService, "getChainIds").mockResolvedValue(mockChainIds);
            jest.spyOn(l1MetricsService, "tvl")
                .mockResolvedValueOnce(mockZkTvl)
                .mockResolvedValueOnce(mockZkTvl);
            jest.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([
                nativeToken,
                nativeToken,
            ]);
            jest.spyOn(l1MetricsService, "chainType").mockResolvedValue("Rollup");
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
                            return acc.plus(BigNumber(curr.amountUsd));
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
                            return acc.plus(BigNumber(curr.amountUsd));
                        }, new BigNumber(0))
                        .toString(),
                    metadata: new ZkChainMetadata(
                        zkChainsMetadata.get(mockChainIds[1] as bigint) as ZkChainMetadata,
                    ),
                    rpc: false,
                },
            ];
            const result = await controller.getEcosystem();

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
            zkChainsMetadata.clear();
            zkChainsMetadata.set(388n, {
                chainId: 388n,
                chainType: "Rollup",
                baseToken: {
                    symbol: "zkCRO",
                    name: "zkCRO",
                    contractAddress: "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2",
                    coingeckoId: "unknown",
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

            jest.spyOn(l1MetricsService, "l1Tvl").mockResolvedValue(mockL1Tvl);
            jest.spyOn(l1MetricsService, "ethGasInfo").mockResolvedValue(mockGasInfo);
            jest.spyOn(l1MetricsService, "getChainIds").mockResolvedValue(mockChainIds);
            jest.spyOn(l1MetricsService, "tvl")
                .mockResolvedValueOnce(mockZkTvl)
                .mockResolvedValueOnce(mockZkTvl);
            jest.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([
                nativeToken,
                nativeToken,
            ]);
            jest.spyOn(l1MetricsService, "chainType").mockResolvedValue(mockedChainType);

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
                            return acc.plus(BigNumber(curr.amountUsd));
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
                            return acc.plus(BigNumber(curr.amountUsd));
                        }, new BigNumber(0))
                        .toString(),
                    metadata: new ZkChainMetadata(
                        zkChainsMetadata.get(mockChainIds[1] as bigint) as ZkChainMetadata,
                    ),
                    rpc: false,
                },
            ];
            const result = await controller.getEcosystem();

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

            jest.spyOn(l1MetricsService, "l1Tvl").mockResolvedValue(mockL1Tvl);
            jest.spyOn(l1MetricsService, "ethGasInfo").mockResolvedValue(mockGasInfo);
            jest.spyOn(l1MetricsService, "getChainIds").mockResolvedValue(mockChainIds);
            const mockZkChains: ZKChainSummary[] = [];
            const result = await controller.getEcosystem();
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
            jest.spyOn(l1MetricsService, "l1Tvl").mockRejectedValue(new Error("l1Tvl error"));

            await expect(controller.getEcosystem()).rejects.toThrow("l1Tvl error");
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

            jest.spyOn(l1MetricsService, "getChainIds").mockResolvedValue([chainIdBn]);
            jest.spyOn(l1MetricsService, "tvl").mockResolvedValue(mockZkTvl);
            jest.spyOn(l1MetricsService, "getBatchesInfo").mockResolvedValue(mockBatchesInfo);
            jest.spyOn(l1MetricsService, "feeParams").mockResolvedValue(mockFeeParams);
            jest.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([nativeToken]);
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

            const result = await controller.getChain(chainId);

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

            jest.spyOn(l1MetricsService, "getChainIds").mockResolvedValue([chainIdBn]);
            jest.spyOn(l1MetricsService, "tvl").mockResolvedValue(mockZkTvl);
            jest.spyOn(l1MetricsService, "getBatchesInfo").mockResolvedValue(mockBatchesInfo);
            jest.spyOn(l1MetricsService, "feeParams").mockResolvedValue(mockFeeParams);
            jest.spyOn(l1MetricsService, "getBaseTokens").mockResolvedValue([nativeToken]);
            jest.spyOn(l1MetricsService, "chainType").mockResolvedValue(mockedChainType);
            zkChainsMetadata.clear();

            const result = await controller.getChain(chainId);

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

        it("should throw ChainNotFound exception when chain ID is not found", async () => {
            const chainId = 999;
            jest.spyOn(l1MetricsService, "getChainIds").mockResolvedValue([]);

            await expect(controller.getChain(chainId)).rejects.toThrow(ChainNotFound);
        });
    });
});
