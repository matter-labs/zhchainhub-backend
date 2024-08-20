import { ApiPropertyOptional } from "@nestjs/swagger";

import { AssetTvl } from "@zkchainhub/metrics/types";
import { ChainType, Token } from "@zkchainhub/shared";

import { BatchesInfo, FeeParams, L2ChainInfo, ZkChainMetadata } from ".";

/**
 * ZKChainInfo class representing the ZK chain information.
 */
export class ZKChainInfo {
    /**
     * The type of chain.
     * @type {ChainType}
     * @memberof ZKChainInfo
     */
    chainType: ChainType;

    /**
     * The native token of the chain (optional).
     * @type {Token<"erc20" | "native">}
     * @memberof ZKChainSummary
     */
    baseToken?: Token<"erc20" | "native">;
    /**
     * A map of asset names to their respective amounts.
     * @type {AssetTvl}
     * @memberof ZKChainInfo
     */
    tvl: AssetTvl[];

    /**
     * Optional batches information.
     * @type {BatchesInfo}
     * @memberof ZKChainInfo
     */
    batchesInfo?: BatchesInfo;

    /**
     * The fee parameters.
     * @type {FeeParams}
     * @memberof ZKChainInfo
     */
    feeParams: FeeParams;

    /**
     * Optional metadata.
     * @type {ZkChainMetadata}
     * @memberof ZKChainInfo
     */
    @ApiPropertyOptional({ type: ZkChainMetadata })
    metadata?: ZkChainMetadata;

    /**
     * Optional Layer 2 chain information.
     * @type {L2ChainInfo}
     * @memberof ZKChainInfo
     */
    @ApiPropertyOptional()
    l2ChainInfo?: L2ChainInfo;

    constructor(data: ZKChainInfo) {
        this.chainType = data.chainType;
        this.tvl = data.tvl;
        this.baseToken = data.baseToken;
        this.batchesInfo = data.batchesInfo;
        this.feeParams = data.feeParams;
        this.metadata = data.metadata;
        this.l2ChainInfo = data.l2ChainInfo;
    }
}
