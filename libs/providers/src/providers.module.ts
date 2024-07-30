import { Module } from "@nestjs/common";

import { LoggerModule } from "@zkchainhub/shared";

import { EvmProviderService } from "./providers";
import { ZKChainProviderService } from "./providers/zkChainProvider.service";

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({
    imports: [LoggerModule],
    providers: [EvmProviderService, ZKChainProviderService],
    exports: [EvmProviderService, ZKChainProviderService],
})
export class ProvidersModule {}
