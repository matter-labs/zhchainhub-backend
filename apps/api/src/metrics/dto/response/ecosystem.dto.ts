import { AssetTvl } from "@zkchainhub/metrics";
import { ChainType, Token } from "@zkchainhub/shared";

import { EthGasInfo, ZkChainMetadata } from "./index.js";

/**
 * EcosystemInfo class representing the information about the ecosystem.
 */
export class EcosystemInfo {
    /**
     * A map of asset names to their respective amounts for L1.
     * @type {AssetDistribution}
     * @memberof EcosystemInfo
     * @example { ETH: 1000000, ZK: 500000 }
     */
    l1Tvl: AssetTvl[];

    /**
     * The Ethereum gas information.
     * @type {EthGasInfo}
     * @memberof EcosystemInfo
     */
    ethGasInfo: EthGasInfo;

    /**
     * An array of ZK chain summaries.
     * @type {ZKChainSummary[]}
     * @memberof EcosystemInfo
     */
    zkChains: ZKChainSummary[];

    /**
     * Constructs an instance of the EcosystemInfo class.
     * @param {EcosystemInfo} data - The data to initialize the instance with.
     */
    constructor(data: EcosystemInfo) {
        this.l1Tvl = data.l1Tvl;
        this.ethGasInfo = data.ethGasInfo;
        this.zkChains = data.zkChains;
    }
}

/**
 * ZKChainSummary class representing the summary information of a ZK chain.
 */
export class ZKChainSummary {
    /**
     * The ID of the chain.
     * @type {number}
     * @memberof ZKChainSummary
     */
    chainId: string;

    /**
     * The type of chain.
     * @type {ChainType}
     * @memberof ZKChainSummary
     */
    chainType: ChainType;

    /**
     * The native token of the chain (optional).
     * @type {string}
     * @memberof ZKChainSummary
     */
    baseToken?: Token<"erc20" | "native">;

    /**
     * The total value locked in the chain.
     * @type {string}
     * @memberof ZKChainSummary
     */
    tvl: string;

    /**
     * Metadata flag (optional).
     * @type {ZkChainMetadata}
     * @memberof ZKChainSummary
     */
    metadata?: ZkChainMetadata;

    /**
     * RPC flag (optional).
     * @type {boolean}
     * @memberof ZKChainSummary
     */
    rpc?: boolean;

    constructor(data: ZKChainSummary) {
        this.chainId = data.chainId;
        this.chainType = data.chainType;
        this.baseToken = data.baseToken;
        this.tvl = data.tvl;
        this.metadata = data.metadata;
        this.rpc = data.rpc;
    }
}
