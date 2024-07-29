/**
 * AssetDistribution class representing a map of asset names to their respective amounts.
 */
export class AssetDistribution {
    [asset: string]: number;
}

/**
 * BatchesInfo class representing information about batches.
 */
export class BatchesInfo {
    /**
     * The number of committed batches.
     * @type {number}
     * @memberof BatchesInfo
     */
    commited: number;

    /**
     * The number of verified batches.
     * @type {number}
     * @memberof BatchesInfo
     */
    verified: number;

    /**
     * The number of proved batches.
     * @type {number}
     * @memberof BatchesInfo
     */
    proved: number;

    /**
     * Constructs an instance of the BatchesInfo class.
     * @param {BatchesInfo} data - The data to initialize the instance with.
     */
    constructor(data: BatchesInfo) {
        this.commited = data.commited;
        this.verified = data.verified;
        this.proved = data.proved;
    }
}

/**
 * EthGasInfo class representing information about Ethereum gas.
 */
export class EthGasInfo {
    /**
     * The gas price.
     * @type {number}
     * @memberof EthGasInfo
     */
    gasPrice: number;

    /**
     * The gas cost for ETH transfer.
     * @type {number}
     * @memberof EthGasInfo
     */
    ethTransfer: number;

    /**
     * The gas cost for ERC20 transfer.
     * @type {number}
     * @memberof EthGasInfo
     */
    erc20Transfer: number;

    constructor(data: EthGasInfo) {
        this.gasPrice = data.gasPrice;
        this.ethTransfer = data.ethTransfer;
        this.erc20Transfer = data.erc20Transfer;
    }
}

/**
 * FeeParams class representing fee parameters.
 */
export class FeeParams {
    /**
     * The overhead L1 gas for batch.
     * @type {number}
     * @memberof FeeParams
     */
    batchOverheadL1Gas: number;

    /**
     * The maximum pubdata per batch.
     * @type {number}
     * @memberof FeeParams
     */
    maxPubdataPerBatch: number;

    /**
     * The maximum L2 gas per batch.
     * @type {number}
     * @memberof FeeParams
     */
    maxL2GasPerBatch: number;

    /**
     * The maximum pubdata for priority transactions.
     * @type {number}
     * @memberof FeeParams
     */
    priorityTxMaxPubdata: number;

    /**
     * The minimal L2 gas price.
     * @type {number}
     * @memberof FeeParams
     */
    minimalL2GasPrice: number;

    /**
     * Constructs an instance of the FeeParams class.
     * @param {FeeParams} data - The data to initialize the instance with.
     */
    constructor(data: FeeParams) {
        this.batchOverheadL1Gas = data.batchOverheadL1Gas;
        this.maxPubdataPerBatch = data.maxPubdataPerBatch;
        this.maxL2GasPerBatch = data.maxL2GasPerBatch;
        this.priorityTxMaxPubdata = data.priorityTxMaxPubdata;
        this.minimalL2GasPrice = data.minimalL2GasPrice;
    }
}
