import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

import { bridgeHubAbi, sharedBridgeAbi } from "@zkchainhub/metrics/l1/abis";
import { IPricingService, PRICING_PROVIDER } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { L1_CONTRACTS } from "@zkchainhub/shared";

import { L1MetricsService } from "./l1MetricsService";

// Mock implementations of the dependencies
const mockEvmProviderService = {
    // Mock methods and properties as needed
};

const mockPricingService = {
    // Mock methods and properties as needed
};

export const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

describe("L1MetricsService", () => {
    let l1MetricsService: L1MetricsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                L1MetricsService,
                {
                    provide: L1MetricsService,
                    useFactory: (
                        evmProviderService: EvmProviderService,
                        pricingService: IPricingService,
                        logger: Logger,
                    ) => {
                        return new L1MetricsService(evmProviderService, pricingService, logger);
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

        l1MetricsService = module.get<L1MetricsService>(L1MetricsService);
    });

    describe("constructor", () => {
        it("initialize bridgeHub and sharedBridge", () => {
            expect(l1MetricsService["bridgeHub"]).toEqual({
                abi: bridgeHubAbi,
                address: L1_CONTRACTS.BRIDGE_HUB,
            });
            expect(l1MetricsService["sharedBridge"]).toEqual({
                abi: sharedBridgeAbi,
                address: L1_CONTRACTS.SHARED_BRIDGE,
            });
        });

        it("initialize diamondContracts map as empty", () => {
            expect(l1MetricsService["diamondContracts"].size).toBe(0);
        });
    });

    describe("l1Tvl", () => {
        it("return l1Tvl", async () => {
            const result = await l1MetricsService.l1Tvl();
            expect(result).toEqual({ ETH: { amount: 1000000, amountUsd: 1000000 } });
        });
    });

    describe("getBatchesInfo", () => {
        it("return getBatchesInfo", async () => {
            const result = await l1MetricsService.getBatchesInfo(1);
            expect(result).toEqual({ commited: 100, verified: 100, proved: 100 });
        });
    });

    describe("tvl", () => {
        it("return tvl", async () => {
            const result = await l1MetricsService.tvl(1);
            expect(result).toEqual({ ETH: { amount: 1000000, amountUsd: 1000000 } });
        });
    });

    describe("chainType", () => {
        it("return chainType", async () => {
            const result = await l1MetricsService.chainType(1);
            expect(result).toBe("rollup");
        });
    });

    describe("ethGasInfo", () => {
        it("return ethGasInfo", async () => {
            const result = await l1MetricsService.ethGasInfo();
            expect(result).toEqual({ gasPrice: 50, ethTransfer: 21000, erc20Transfer: 65000 });
        });
    });

    describe("feeParams", () => {
        it("return feeParams", async () => {
            const result = await l1MetricsService.feeParams(1);
            expect(result).toEqual({
                batchOverheadL1Gas: 50000,
                maxPubdataPerBatch: 120000,
                maxL2GasPerBatch: 10000000,
                priorityTxMaxPubdata: 15000,
                minimalL2GasPrice: 10000000,
            });
        });
    });
});
