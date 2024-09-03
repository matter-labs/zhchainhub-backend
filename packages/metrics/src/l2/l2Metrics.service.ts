import { ZKChainProvider } from "@zkchainhub/chain-providers";
import { ILogger } from "@zkchainhub/shared";

/**
 * Acts as a wrapper around Viem library to provide methods to interact with zkSync chains.
 */
export class L2MetricsService {
    constructor(
        private readonly provider: ZKChainProvider,
        private readonly logger: ILogger,
    ) {}

    /**
     * Retrieves the transactions per second (TPS) from the provider.
     *
     * @returns A promise that resolves to the number of transactions per second.
     */
    async tps(): Promise<number> {
        return this.provider.tps();
    }

    /**
     * Retrieves the average block time from the provider.
     *
     * @returns A promise that resolves to the average block time as a number.
     */
    async avgBlockTime(): Promise<number> {
        return this.provider.avgBlockTime();
    }

    /**
     * Retrieves the number of the last block in the chain.
     *
     * @returns A promise that resolves to a bigint representing the number of the last block.
     */
    async lastBlock(): Promise<bigint> {
        return this.provider.getBlockNumber();
    }

    /**
     * Retrieves the last verified block based on the given lastVerifiedBatch.
     *
     * @param lastVerifiedBatch The number representing the last verified batch.
     * @returns A Promise that resolves to the number of the last verified block, or undefined if an error occurs.
     */
    async getLastVerifiedBlock(lastVerifiedBatch: number): Promise<number | undefined> {
        const [, endBlock] = await this.provider.getL1BatchBlockRange(lastVerifiedBatch);
        return endBlock;
    }
}
