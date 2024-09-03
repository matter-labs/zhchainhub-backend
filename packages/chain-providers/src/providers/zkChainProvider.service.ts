import {
    Chain,
    Client,
    createClient,
    fallback,
    FallbackTransport,
    http,
    HttpTransport,
} from "viem";
import {
    GetL1BatchBlockRangeReturnParameters,
    GetL1BatchDetailsReturnType,
    PublicActionsL2,
    publicActionsL2,
} from "viem/zksync";

import { ILogger } from "@zkchainhub/shared";

import { InvalidArgumentException } from "../internal.js";
import { EvmProvider } from "./evmProvider.service.js";

/**
 * Acts as a wrapper around Viem library to provide methods to interact with ZK chains.
 */
export class ZKChainProvider extends EvmProvider {
    private zkClient: Client<
        FallbackTransport<HttpTransport[]>,
        Chain | undefined,
        undefined,
        undefined,
        PublicActionsL2
    >;

    constructor(rpcUrls: string[], logger: ILogger, chain: Chain | undefined = undefined) {
        super(rpcUrls, chain, logger);
        this.zkClient = createClient({
            chain,
            transport: fallback(rpcUrls.map((rpcUrl) => http(rpcUrl))),
        }).extend(publicActionsL2());
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
     * Retrieves the block range for a given L1 batch number.
     *
     * @param l1BatchNumber - The L1 batch number.
     * @returns A promise that resolves to the block range for the specified L1 batch number.
     */
    async getL1BatchBlockRange(
        l1BatchNumber: number,
    ): Promise<GetL1BatchBlockRangeReturnParameters> {
        return this.zkClient.getL1BatchBlockRange({ l1BatchNumber });
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
