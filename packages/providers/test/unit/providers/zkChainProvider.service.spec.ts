import { GetBlockReturnType } from "viem";
import { localhost } from "viem/chains";
import { GetL1BatchDetailsReturnType } from "viem/zksync";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ILogger } from "@zkchainhub/shared";

import {
    InvalidArgumentException,
    RpcUrlsEmpty,
    ZKChainProviderService,
} from "../../../src/internal.js";

export const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

describe("ZKChainProviderService", () => {
    let zkProvider: ZKChainProviderService;
    const defaultMockChain = localhost;
    const defaultRpcUrls = ["http://localhost:8545"];

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("has a zkclient property defined", () => {
        zkProvider = new ZKChainProviderService(defaultRpcUrls, defaultMockChain, mockLogger);
        expect(zkProvider["zkClient"]).toBeDefined();
    });

    it("throws RpcUrlsEmpty error if rpcUrls is empty", () => {
        expect(() => {
            new ZKChainProviderService([], localhost, mockLogger);
        }).toThrowError(RpcUrlsEmpty);
    });

    describe("avgBlockTime", () => {
        it("should return the average block time over the given range", async () => {
            zkProvider = new ZKChainProviderService(defaultRpcUrls, defaultMockChain, mockLogger);
            const currentBlockNumber = 1000;
            const range = 100;
            const currentBlockTimestamp = { timestamp: BigInt(123234345) };
            const prevBlockTimestamp = { timestamp: BigInt(123123123) };

            vi.spyOn(zkProvider, "getBlockNumber").mockResolvedValue(BigInt(currentBlockNumber));
            vi.spyOn(zkProvider, "getBlockByNumber").mockImplementation((blockNumber) => {
                if (blockNumber === currentBlockNumber) {
                    return Promise.resolve(currentBlockTimestamp as unknown as GetBlockReturnType);
                } else if (blockNumber === currentBlockNumber - range) {
                    return Promise.resolve(prevBlockTimestamp as unknown as GetBlockReturnType);
                }
                return Promise.reject(new Error("Block number not found"));
            });

            const avgTime = await zkProvider.avgBlockTime(range);

            expect(avgTime).toBe(
                (Number(currentBlockTimestamp.timestamp) - Number(prevBlockTimestamp.timestamp)) /
                    range,
            );
            expect(zkProvider.getBlockNumber).toHaveBeenCalled();
            expect(zkProvider.getBlockByNumber).toHaveBeenCalledWith(currentBlockNumber);
            expect(zkProvider.getBlockByNumber).toHaveBeenCalledWith(currentBlockNumber - range);
        });

        it("should throw an InvalidArgumentException if the range is less than 1", async () => {
            zkProvider = new ZKChainProviderService(defaultRpcUrls, defaultMockChain, mockLogger);
            await expect(zkProvider.avgBlockTime(0)).rejects.toThrowError(
                new InvalidArgumentException("range for avgBlockTime should be >= 1"),
            );
        });
    });

    describe("tps", () => {
        it("should return the transactions per second (TPS)", async () => {
            zkProvider = new ZKChainProviderService(defaultRpcUrls, defaultMockChain, mockLogger);
            const currentBatchNumber = 1000; // 1000 in hexadecimal
            const currentBatchDetails = { l2TxCount: 200, timestamp: 123234345 };
            const prevBatchDetails = { timestamp: 123123123 };

            vi.spyOn(zkProvider, "getL1BatchNumber").mockResolvedValue(currentBatchNumber);
            vi.spyOn(zkProvider, "getL1BatchDetails").mockImplementation((batchNumber) => {
                if (batchNumber === currentBatchNumber) {
                    return Promise.resolve(
                        currentBatchDetails as unknown as GetL1BatchDetailsReturnType,
                    );
                } else if (batchNumber === currentBatchNumber - 1) {
                    return Promise.resolve(
                        prevBatchDetails as unknown as GetL1BatchDetailsReturnType,
                    );
                }
                return Promise.reject(new Error("Block number not found"));
            });
            const tps = await zkProvider.tps();
            expect(tps).toBe(0.0017982053910197623);
            expect(zkProvider.getL1BatchNumber).toHaveBeenCalled();
            expect(zkProvider.getL1BatchDetails).toHaveBeenCalledWith(1000);
            expect(zkProvider.getL1BatchDetails).toHaveBeenCalledWith(999);
        });

        it("should handle the case when there are no transactions", async () => {
            zkProvider = new ZKChainProviderService(defaultRpcUrls, defaultMockChain, mockLogger);
            const currentBatchNumber = 1000; // 1000 in hexadecimal
            const currentBatchDetails = { l2TxCount: 0, timestamp: 123234345 };
            const prevBatchDetails = { timestamp: 123123123 };

            vi.spyOn(zkProvider, "getL1BatchNumber").mockResolvedValue(currentBatchNumber);
            vi.spyOn(zkProvider, "getL1BatchDetails").mockImplementation((batchNumber) => {
                if (batchNumber === currentBatchNumber) {
                    return Promise.resolve(
                        currentBatchDetails as unknown as GetL1BatchDetailsReturnType,
                    );
                } else if (batchNumber === currentBatchNumber - 1) {
                    return Promise.resolve(
                        prevBatchDetails as unknown as GetL1BatchDetailsReturnType,
                    );
                }
                return Promise.reject(new Error("Block number not found"));
            });
            const tps = await zkProvider.tps();
            expect(tps).toBe(0); // 200 transactions over 10000 seconds
            expect(zkProvider.getL1BatchNumber).toHaveBeenCalled();
            expect(zkProvider.getL1BatchDetails).toHaveBeenCalledWith(1000);
            expect(zkProvider.getL1BatchDetails).toHaveBeenCalledWith(999);
        });
    });
});
