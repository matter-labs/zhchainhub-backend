import { BigNumber } from "bignumber.js";

import { IMetadataProvider } from "@zkchainhub/metadata";
import { L1MetricsService, L2MetricsService } from "@zkchainhub/metrics";
import { ChainId, ILogger } from "@zkchainhub/shared";

import { EcosystemInfo, L2ChainInfo, ZKChainInfo, ZkChainMetadata } from "../dto/response/index.js";
import { ChainNotFound } from "../exceptions/index.js";

export class MetricsController {
    constructor(
        private readonly l1MetricsService: L1MetricsService,
        private readonly l2MetricsMap: Map<ChainId, L2MetricsService>,
        private readonly metadataProvider: IMetadataProvider,
        private readonly logger: ILogger,
    ) {}

    async getEcosystem(): Promise<EcosystemInfo> {
        const [l1Tvl, gasInfo, chainIds, chainsMetadata] = await Promise.all([
            this.l1MetricsService.l1Tvl(),
            this.l1MetricsService.ethGasInfo(),
            this.l1MetricsService.getChainIds(),
            this.metadataProvider.getChainsMetadata(),
        ]);

        const zkChains = await Promise.all(
            chainIds.map(async (chainId) => {
                const metadata = chainsMetadata.get(chainId);
                const tvl = (await this.l1MetricsService.tvl(chainId))
                    .reduce((acc, curr) => {
                        return acc.plus(BigNumber(curr.amountUsd || 0));
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

    async getChain(chainId: number) {
        const chainIdBn = BigInt(chainId);
        const ecosystemChainIds = await this.l1MetricsService.getChainIds();
        if (!ecosystemChainIds.includes(chainIdBn)) {
            throw new ChainNotFound(chainIdBn);
        }
        const chainsMetadata = await this.metadataProvider.getChainsMetadata();
        const metadata = chainsMetadata.get(chainIdBn);
        const l2MetricsService = this.l2MetricsMap.get(chainIdBn);

        const [tvl, batchesInfo, feeParams, baseTokenInfo] = await Promise.all([
            this.l1MetricsService.tvl(chainIdBn),
            this.l1MetricsService.getBatchesInfo(chainIdBn),
            this.l1MetricsService.feeParams(chainIdBn),
            this.l1MetricsService.getBaseTokens([chainIdBn]),
        ]);
        let l2ChainInfo: L2ChainInfo | undefined;
        if (l2MetricsService) {
            l2ChainInfo = await this.getL2ChainInfo(l2MetricsService, Number(batchesInfo.verified));
        }

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
                l2ChainInfo,
            });
        }

        const { chainId: _metadataChainId, ...metadataRest } = metadata;
        void _metadataChainId;
        return new ZKChainInfo({
            ...baseZkChainInfo,
            chainType: metadataRest.chainType,
            baseToken: metadataRest.baseToken,
            metadata: new ZkChainMetadata(metadataRest),
            l2ChainInfo,
        });
    }

    private async getL2ChainInfo(
        l2MetricsService: L2MetricsService,
        verifiedBatches: number,
    ): Promise<L2ChainInfo | undefined> {
        const [tpsResult, avgBlockTimeResult, lastBlockResult, lastBlockVerifiedResult] =
            await Promise.allSettled([
                l2MetricsService.tps(),
                l2MetricsService.avgBlockTime(),
                l2MetricsService.lastBlock(),
                l2MetricsService.getLastVerifiedBlock(verifiedBatches),
            ]);

        if (
            tpsResult.status === "rejected" &&
            avgBlockTimeResult.status === "rejected" &&
            lastBlockResult.status === "rejected" &&
            lastBlockVerifiedResult.status === "rejected"
        )
            return undefined;

        return new L2ChainInfo({
            tps: tpsResult.status === "fulfilled" ? tpsResult.value : undefined,
            avgBlockTime:
                avgBlockTimeResult.status === "fulfilled" ? avgBlockTimeResult.value : undefined,
            lastBlock:
                lastBlockResult.status === "fulfilled"
                    ? lastBlockResult.value.toString()
                    : undefined,
            lastBlockVerified:
                lastBlockVerifiedResult.status === "fulfilled"
                    ? lastBlockVerifiedResult.value
                    : undefined,
        });
    }
}
