import { Module } from "@nestjs/common";

import { ProvidersModule } from "@zkchainhub/providers";

import { L1MetricsService } from "./l1";

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({
    imports: [ProvidersModule],
    providers: [L1MetricsService],
    exports: [L1MetricsService],
})
export class MetricsModule {}
