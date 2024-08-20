import { Controller, Get, Inject, Logger, LoggerService, Param } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import BigNumber from "bignumber.js";

import { L1MetricsService } from "@zkchainhub/metrics/l1";
import { zkChainsMetadata } from "@zkchainhub/shared";

import { ParsePositiveIntPipe } from "../common/pipes/parsePositiveInt.pipe";
import { EcosystemInfo, ZKChainInfo, ZkChainMetadata } from "./dto/response";
import { ChainNotFound } from "./exceptions";

@ApiTags("metrics")
@Controller("metrics")
/**
 * Controller for handling metrics related endpoints.
 */
export class MetricsController {
    constructor(
        @Inject(Logger) private readonly logger: LoggerService,
        private readonly l1MetricsService: L1MetricsService,
    ) {}
    /**
     * Retrieves the ecosystem information.
     * @returns {Promise<EcosystemInfo>} The ecosystem information.
     */
    @Get("/ecosystem")
    public async getEcosystem(): Promise<EcosystemInfo> {
        const [l1Tvl, gasInfo, chainIds] = await Promise.all([
            this.l1MetricsService.l1Tvl(),
            this.l1MetricsService.ethGasInfo(),
            this.l1MetricsService.getChainIds(),
        ]);
        const zkChains = await Promise.all(
            chainIds.map(async (chainId) => {
                const metadata = zkChainsMetadata.get(chainId);
                const tvl = (await this.l1MetricsService.tvl(chainId))
                    .reduce((acc, curr) => {
                        return acc.plus(BigNumber(curr.amountUsd));
                    }, new BigNumber(0))
                    .toString();
                const chainIdStr = chainId.toString();
                if (!metadata) {
                    return {
                        chainId: chainIdStr,
                        chainType: await this.l1MetricsService.chainType(chainId),
                        baseToken: (await this.l1MetricsService.getBaseTokens([chainId]))[0],
                        tvl,
                        rpc: false,
                    };
                }
                return {
                    chainId: chainIdStr,
                    chainType: metadata.chainType,
                    baseToken: metadata.baseToken,
                    tvl,
                    metadata: new ZkChainMetadata(metadata),
                    rpc: false,
                };
            }),
        );
        return new EcosystemInfo({
            l1Tvl,
            ethGasInfo: {
                gasPrice: gasInfo.gasPrice.toString(),
                erc20Transfer: gasInfo.erc20Transfer.toString(),
                ethTransfer: gasInfo.ethTransfer.toString(),
                ethPrice: gasInfo.ethPrice?.toString(),
            },
            zkChains,
        });
    }

    /**
     * Retrieves the chain information for the specified chain ID.
     * @param {number} chainId - The ID of the chain.
     * @returns {Promise<ZKChainInfo>} The chain information.
     */

    @ApiResponse({ status: 200, type: ZKChainInfo })
    @Get("zkchain/:chainId")
    public async getChain(
        @Param("chainId", new ParsePositiveIntPipe()) chainId: number,
    ): Promise<ZKChainInfo> {
        const chainIdBn = BigInt(chainId);
        const metadata = zkChainsMetadata.get(chainIdBn);
        const ecosystemChainIds = await this.l1MetricsService.getChainIds();
        if (ecosystemChainIds.includes(chainIdBn) === false) {
            throw new ChainNotFound(chainIdBn);
        }

        const [tvl, batchesInfo, feeParams, baseTokenInfo] = await Promise.all([
            this.l1MetricsService.tvl(chainIdBn),
            this.l1MetricsService.getBatchesInfo(chainIdBn),
            this.l1MetricsService.feeParams(chainIdBn),
            this.l1MetricsService.getBaseTokens([chainIdBn]),
        ]);
        const baseToken = baseTokenInfo[0];

        const baseZkChainInfo = {
            batchesInfo: {
                commited: batchesInfo.commited.toString(),
                verified: batchesInfo.verified.toString(),
                executed: batchesInfo.executed.toString(),
            },
            tvl,
            feeParams: {
                batchOverheadL1Gas: feeParams.batchOverheadL1Gas,
                maxL2GasPerBatch: feeParams.maxL2GasPerBatch,
                maxPubdataPerBatch: feeParams.maxPubdataPerBatch,
                minimalL2GasPrice: feeParams.minimalL2GasPrice.toString(),
                priorityTxMaxPubdata: feeParams.priorityTxMaxPubdata,
            },
        };
        if (!metadata) {
            return new ZKChainInfo({
                ...baseZkChainInfo,
                chainType: await this.l1MetricsService.chainType(chainIdBn),
                baseToken,
            });
        }
        const { chainId: _metadataChainId, ...metadataRest } = metadata;
        void _metadataChainId;
        return new ZKChainInfo({
            ...baseZkChainInfo,
            chainType: metadataRest.chainType,
            baseToken: metadataRest.baseToken,
            metadata: new ZkChainMetadata(metadataRest),
        });
    }
}
