import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Chains, ChainType } from "@zkchainhub/shared";

import { AssetDistribution, BatchesInfo, FeeParams, L2ChainInfo, Metadata } from ".";

/**
 * ZKChainInfo class representing the ZK chain information.
 */
export class ZKChainInfo {
    /**
     * The type of chain.
     * @type {ChainType}
     * @memberof ZKChainInfo
     */
    @ApiProperty({ enum: Chains, enumName: "ChainType" })
    chainType: ChainType;

    /**
     * A map of asset names to their respective amounts.
     * @type {AssetDistribution}
     * @memberof ZKChainInfo
     * @example { ETH: 1000000, ZK: 500000 }
     */
    @ApiProperty({
        example: { ETH: 1000000, ZK: 500000 },
        description: "A map of asset names to their respective amounts",
        additionalProperties: {
            type: "number",
        },
    })
    tvl: AssetDistribution;

    /**
     * Optional batches information.
     * @type {BatchesInfo}
     * @memberof ZKChainInfo
     */
    @ApiPropertyOptional()
    batchesInfo?: BatchesInfo;

    /**
     * The fee parameters.
     * @type {FeeParams}
     * @memberof ZKChainInfo
     */
    feeParams: FeeParams;

    /**
     * Optional metadata.
     * @type {Metadata}
     * @memberof ZKChainInfo
     */
    @ApiPropertyOptional({ type: Metadata })
    metadata?: Metadata;

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
        this.batchesInfo = data.batchesInfo;
        this.feeParams = data.feeParams;
        this.metadata = data.metadata;
        this.l2ChainInfo = data.l2ChainInfo;
    }
}
