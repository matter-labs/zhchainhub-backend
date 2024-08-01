import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { bridgeHubAbi, sharedBridgeAbi } from "@zkchainhub/metrics/l1/abis";
import { IPricingService, PRICING_PROVIDER } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { AbiWithAddress, ChainId, L1_CONTRACTS } from "@zkchainhub/shared";

/**
 * Acts as a wrapper around Viem library to provide methods to interact with an EVM-based blockchain.
 */
@Injectable()
export class L1MetricsService {
    private readonly bridgeHub: Readonly<AbiWithAddress> = {
        abi: bridgeHubAbi,
        address: L1_CONTRACTS.BRIDGE_HUB,
    };
    private readonly sharedBridge: Readonly<AbiWithAddress> = {
        abi: sharedBridgeAbi,
        address: L1_CONTRACTS.SHARED_BRIDGE,
    };
    private readonly diamondContracts: Map<ChainId, AbiWithAddress> = new Map();

    constructor(
        private readonly evmProviderService: EvmProviderService,
        @Inject(PRICING_PROVIDER) private readonly pricingService: IPricingService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    //TODO: Implement l1Tvl.
    async l1Tvl(): Promise<{ [asset: string]: { amount: number; amountUsd: number } }> {
        return { ETH: { amount: 1000000, amountUsd: 1000000 } };
    }
    //TODO: Implement getBatchesInfo.
    async getBatchesInfo(
        _chainId: number,
    ): Promise<{ commited: number; verified: number; proved: number }> {
        return { commited: 100, verified: 100, proved: 100 };
    }
    //TODO: Implement tvl.
    async tvl(
        _chainId: number,
    ): Promise<{ [asset: string]: { amount: number; amountUsd: number } }> {
        return { ETH: { amount: 1000000, amountUsd: 1000000 } };
    }
    //TODO: Implement chainType.
    async chainType(_chainId: number): Promise<"validium" | "rollup"> {
        return "rollup";
    }
    //TODO: Implement ethGasInfo.
    async ethGasInfo(): Promise<{ gasPrice: number; ethTransfer: number; erc20Transfer: number }> {
        return { gasPrice: 50, ethTransfer: 21000, erc20Transfer: 65000 };
    }
    //TODO: Implement feeParams.
    async feeParams(_chainId: number): Promise<{
        batchOverheadL1Gas: number;
        maxPubdataPerBatch: number;
        maxL2GasPerBatch: number;
        priorityTxMaxPubdata: number;
        minimalL2GasPrice: number;
    }> {
        return {
            batchOverheadL1Gas: 50000,
            maxPubdataPerBatch: 120000,
            maxL2GasPerBatch: 10000000,
            priorityTxMaxPubdata: 15000,
            minimalL2GasPrice: 10000000,
        };
    }
}
