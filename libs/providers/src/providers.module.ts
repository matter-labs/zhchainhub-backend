import { Module } from "@nestjs/common";

import { EvmProviderService } from "./providers";

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({
    providers: [EvmProviderService],
    exports: [EvmProviderService],
})
export class ProvidersModule {}
