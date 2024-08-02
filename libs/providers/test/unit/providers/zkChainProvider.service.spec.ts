import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { GetBlockReturnType } from "viem";
import { localhost } from "viem/chains";
import { GetL1BatchDetailsReturnType } from "viem/zksync";
import { Logger } from "winston";

import { ZKChainProviderService } from "@zkchainhub/providers";
import { InvalidArgumentException } from "@zkchainhub/providers/exceptions";

export const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

describe("ZKChainProviderService", () => {
    let zkProvider: ZKChainProviderService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: WINSTON_MODULE_PROVIDER,
                    useValue: mockLogger,
                },
                {
                    provide: ZKChainProviderService,
                    useFactory: () => {
                        const rpcUrl = "http://localhost:8545";
                        const chain = localhost;
                        return new ZKChainProviderService(rpcUrl, chain, mockLogger as Logger);
                    },
                },
            ],
        }).compile();

        zkProvider = app.get<ZKChainProviderService>(ZKChainProviderService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("avgBlockTime", () => {
        it("should return the average block time over the given range", async () => {
            const currentBlockNumber = 1000;
            const range = 100;
            const currentBlockTimestamp = { timestamp: BigInt(123234345) };
            const prevBlockTimestamp = { timestamp: BigInt(123123123) };

            jest.spyOn(zkProvider, "getBlockNumber").mockResolvedValue(BigInt(currentBlockNumber));
            jest.spyOn(zkProvider, "getBlockByNumber").mockImplementation((blockNumber) => {
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
            await expect(zkProvider.avgBlockTime(0)).rejects.toThrowError(
                new InvalidArgumentException("range for avgBlockTime should be >= 1"),
            );
        });
    });

    describe("tps", () => {
        it("should return the transactions per second (TPS)", async () => {
            const currentBatchNumber = 1000; // 1000 in hexadecimal
            const currentBatchDetails = { l2TxCount: 200, timestamp: 123234345 };
            const prevBatchDetails = { timestamp: 123123123 };

            jest.spyOn(zkProvider, "getL1BatchNumber").mockResolvedValue(currentBatchNumber);
            jest.spyOn(zkProvider, "getL1BatchDetails").mockImplementation((batchNumber) => {
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
            const currentBatchNumber = 1000; // 1000 in hexadecimal
            const currentBatchDetails = { l2TxCount: 0, timestamp: 123234345 };
            const prevBatchDetails = { timestamp: 123123123 };

            jest.spyOn(zkProvider, "getL1BatchNumber").mockResolvedValue(currentBatchNumber);
            jest.spyOn(zkProvider, "getL1BatchDetails").mockImplementation((batchNumber) => {
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
