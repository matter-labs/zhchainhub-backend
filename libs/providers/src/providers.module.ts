import { Module } from "@nestjs/common";

import { EvmProviderService } from "./providers";
import { ZKChainProviderService } from "./providers/zkChainProvider.service";

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({
    providers: [EvmProviderService, ZKChainProviderService],
    exports: [EvmProviderService, ZKChainProviderService],
})
export class ProvidersModule {}
