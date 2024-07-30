import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Chain, Client, createClient, http, HttpTransport } from "viem";
import { GetL1BatchDetailsReturnType, PublicActionsL2, publicActionsL2 } from "viem/zksync";

import { InvalidArgumentException } from "@zkchainhub/providers/exceptions";
import { EvmProviderService } from "@zkchainhub/providers/providers/evmProvider.service";

@Injectable()
/**
 * Acts as a wrapper around Viem library to provide methods to interact with ZK chains.
 */
export class ZKChainProviderService extends EvmProviderService {
    private zkClient: Client<HttpTransport, Chain, undefined, undefined, PublicActionsL2>;

    constructor(
        rpcUrl: string,
        chain: Chain,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) logger: LoggerService,
    ) {
        super(rpcUrl, chain, logger);
        this.zkClient = createClient({ chain, transport: http(rpcUrl) }).extend(publicActionsL2());
    }

    /**
     * Retrieves the details of a specific L1 batch.
     * @param batchNumber The number of the L1 batch.
     * @returns Details of the L1 batch.
     */
    async getL1BatchDetails(batchNumber: number): Promise<GetL1BatchDetailsReturnType> {
        return this.zkClient.getL1BatchDetails({ number: batchNumber });
    }

    /**
     * Retrieves the current L1 batch number.
     * @returns Current L1 batch number.
     */
    async getL1BatchNumber(): Promise<number> {
        return parseInt((await this.zkClient.getL1BatchNumber()).toString(), 16);
    }

    /**
     * Calculates the average block time over a specified range.
     * @param range The number of blocks to consider for calculating the average block time. Default is 1000.
     * @returns Average block time.
     * @throws {InvalidArgumentException} If the range is less than 1.
     */
    async avgBlockTime(range: number = 1000): Promise<number> {
        if (range < 1) {
            throw new InvalidArgumentException("range for avgBlockTime should be >= 1");
        }
        const currentBlockNumber = Number(await this.getBlockNumber());
        const [currentBlockTimestamp, prevBlockTimestamp] = await Promise.all([
            this.getBlockByNumber(currentBlockNumber),
            this.getBlockByNumber(currentBlockNumber - range),
        ]);
        return (
            (Number(currentBlockTimestamp.timestamp) - Number(prevBlockTimestamp.timestamp)) / range
        );
    }

    /**
     * Calculates the transactions per second (TPS) for the current L1 batch.
     * @returns TPS value.
     */
    async tps(): Promise<number> {
        const currentBatchNumber = await this.getL1BatchNumber();
        const [currentBatch, prevBatch] = await Promise.all([
            this.getL1BatchDetails(currentBatchNumber),
            this.getL1BatchDetails(currentBatchNumber - 1),
        ]);

        const txCount = currentBatch.l2TxCount;
        const blockTime = currentBatch.timestamp - prevBatch.timestamp;

        return txCount / blockTime;
    }
}
