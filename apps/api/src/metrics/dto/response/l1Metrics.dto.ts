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
     * @type {string}
     * @memberof BatchesInfo
     */
    commited: string;

    /**
     * The string of verified batches.
     * @type {string}
     * @memberof BatchesInfo
     */
    verified: string;

    /**
     * The string of proved batches.
     * @type {string}
     * @memberof BatchesInfo
     */
    executed: string;

    /**
     * Constructs an instance of the BatchesInfo class.
     * @param {BatchesInfo} data - The data to initialize the instance with.
     */
    constructor(data: BatchesInfo) {
        this.commited = data.commited;
        this.verified = data.verified;
        this.executed = data.executed;
    }
}

/**
 * EthGasInfo class representing information about Ethereum gas.
 */
export class EthGasInfo {
    /**
     * The gas price.
     * @type {string}
     * @memberof EthGasInfo
     */
    gasPrice: string;

    /**
     * The gas cost for ETH transfer.
     * @type {string}
     * @memberof EthGasInfo
     */
    ethTransfer: string;

    /**
     * The gas cost for ERC20 transfer.
     * @type {string}
     * @memberof EthGasInfo
     */
    erc20Transfer: string;

    /**
     * The price of ETH in USD
     * @type {string}
     * @memberof EthGasInfo
     */
    ethPrice?: string;

    constructor(data: EthGasInfo) {
        this.gasPrice = data.gasPrice;
        this.ethTransfer = data.ethTransfer;
        this.erc20Transfer = data.erc20Transfer;
        this.ethPrice = data.ethPrice;
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
     * @type {string}
     * @memberof FeeParams
     */
    minimalL2GasPrice: string;

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
