import { Module } from "@nestjs/common";

import { CoingeckoService, PRICING_PROVIDER, PricingModule } from "@zkchainhub/pricing";
import { ProvidersModule } from "@zkchainhub/providers";
import { LoggerModule } from "@zkchainhub/shared";

import { L1MetricsService } from "./l1";

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({
    imports: [LoggerModule, ProvidersModule, PricingModule],
    providers: [
        L1MetricsService,
        {
            provide: PRICING_PROVIDER,
            useClass: CoingeckoService,
        },
    ],
    exports: [L1MetricsService],
})
export class MetricsModule {}
