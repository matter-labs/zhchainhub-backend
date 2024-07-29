import { Injectable } from "@nestjs/common";

import { EvmProviderService } from "@zkchainhub/providers";

/**
 * Acts as a wrapper around Viem library to provide methods to interact with an EVM-based blockchain.
 */
@Injectable()
export class L1MetricsService {
    constructor(private readonly evmProviderService: EvmProviderService) {}
}
