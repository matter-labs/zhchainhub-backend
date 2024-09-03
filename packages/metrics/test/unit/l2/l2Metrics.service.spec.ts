import { beforeEach, describe, expect, it, vi } from "vitest";

import { ZKChainProvider } from "@zkchainhub/chain-providers";
import { ILogger } from "@zkchainhub/shared";

import { L2MetricsService } from "../../../src/l2/l2Metrics.service";

describe("L2MetricsService", () => {
    let service: L2MetricsService;
    let provider: ZKChainProvider;
    let logger: ILogger;

    beforeEach(() => {
        provider = {
            tps: vi.fn(),
            avgBlockTime: vi.fn(),
            getBlockNumber: vi.fn(),
            getL1BatchBlockRange: vi.fn(),
        } as unknown as ZKChainProvider;
        logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        } as unknown as ILogger;
        service = new L2MetricsService(provider, logger);
    });

    it("should create an instance of L2MetricsService", () => {
        expect(service).toBeDefined();
    });

    describe("tps", () => {
        it("should return the TPS value", async () => {
            const expectedTps = 100;
            vi.spyOn(provider, "tps").mockResolvedValue(expectedTps);

            const result = await service.tps();

            expect(result).toBe(expectedTps);
            expect(provider.tps).toHaveBeenCalled();
        });
    });

    describe("avgBlockTime", () => {
        it("return the average block time", async () => {
            const expectedAvgBlockTime = 10;
            vi.spyOn(provider, "avgBlockTime").mockResolvedValue(expectedAvgBlockTime);

            const result = await service.avgBlockTime();

            expect(result).toBe(expectedAvgBlockTime);
            expect(provider.avgBlockTime).toHaveBeenCalled();
        });
    });

    describe("lastBlock", () => {
        it("return the last block number", async () => {
            const expectedLastBlock = 1000n;
            vi.spyOn(provider, "getBlockNumber").mockResolvedValue(expectedLastBlock);

            const result = await service.lastBlock();

            expect(result).toBe(expectedLastBlock);
            expect(provider.getBlockNumber).toHaveBeenCalled();
        });
    });

    describe("getLastVerifiedBlock", () => {
        it("return the end block of the last verified batch", async () => {
            const lastVerifiedBatch = 5;
            const expectedEndBlock = 100;
            vi.spyOn(provider, "getL1BatchBlockRange").mockResolvedValue([0, expectedEndBlock]);

            const result = await service.getLastVerifiedBlock(lastVerifiedBatch);

            expect(result).toBe(expectedEndBlock);
            expect(provider.getL1BatchBlockRange).toHaveBeenCalledWith(lastVerifiedBatch);
        });
    });
});
