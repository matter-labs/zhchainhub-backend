/**
 * Represents the information about the batches from L2 chain
 */
export interface BatchesInfo {
    /**
     * The total number of batches that were committed
     */
    commited: bigint;
    /**
     * The total number of batches that were committed & verified
     */
    verified: bigint;
    /**
     * The total number of batches that were committed & verified & executed
     */
    executed: bigint;
}
