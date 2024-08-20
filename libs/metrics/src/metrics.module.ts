import { DynamicModule, Logger, Module, ModuleMetadata, Provider } from "@nestjs/common";
import { Address } from "abitype";

import {
    IPricingService,
    PRICING_PROVIDER,
    PricingModule,
    PricingModuleOptions,
    PricingProvider,
} from "@zkchainhub/pricing";
import { EvmProviderService, ProvidersModule, ProvidersModuleOptions } from "@zkchainhub/providers";
import { LoggerModule } from "@zkchainhub/shared";

import { L1MetricsService } from "./l1";

interface MetricsModuleOptions<
    CacheConfig extends Record<string, any>,
    Pricing extends PricingProvider,
> {
    pricingModuleOptions: PricingModuleOptions<CacheConfig, Pricing>;
    providerModuleOptions: ProvidersModuleOptions;
    contracts: {
        bridgeHub: Address;
        sharedBridge: Address;
        stateTransitionManager: Address[];
    };
}

interface MetricsModuleAsyncOptions<
    CacheConfig extends Record<string, any>,
    Pricing extends PricingProvider,
> extends Pick<ModuleMetadata, "imports"> {
    useFactory: (
        ...args: any[]
    ) =>
        | Promise<Pick<MetricsModuleOptions<CacheConfig, Pricing>, "contracts">>
        | Pick<MetricsModuleOptions<CacheConfig, Pricing>, "contracts">;
    inject?: any[];
    extraProviders?: Provider[];
}

const metricsProviderFactory = <
    CacheConfig extends Record<string, any>,
    Pricing extends PricingProvider,
>(
    options: MetricsModuleOptions<CacheConfig, Pricing>,
) => {
    const { bridgeHub, sharedBridge, stateTransitionManager } = options.contracts;
    return {
        provide: L1MetricsService,
        useFactory: (
            evmProviderService: EvmProviderService,
            pricing: IPricingService,
            logger: Logger,
        ) => {
            return new L1MetricsService(
                bridgeHub,
                sharedBridge,
                stateTransitionManager,
                evmProviderService,
                pricing,
                logger,
            );
        },
        inject: [EvmProviderService, PRICING_PROVIDER, Logger],
    };
};
/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({})
export class MetricsModule {
    static register<CacheConfig extends Record<string, any>, Pricing extends PricingProvider>(
        options: MetricsModuleOptions<CacheConfig, Pricing>,
    ): DynamicModule {
        return {
            module: MetricsModule,
            imports: [
                LoggerModule,
                PricingModule.register(options.pricingModuleOptions),
                ProvidersModule.register(options.providerModuleOptions),
            ],
            providers: [metricsProviderFactory(options), Logger],
            exports: [L1MetricsService],
        };
    }

    static registerAsync<CacheConfig extends Record<string, any>, Pricing extends PricingProvider>(
        options: MetricsModuleAsyncOptions<CacheConfig, Pricing>,
    ): DynamicModule {
        return {
            module: MetricsModule,
            imports: options.imports,
            providers: [
                ...(options.extraProviders || []),
                {
                    provide: L1MetricsService,
                    useFactory: async (
                        evmProviderService: EvmProviderService,
                        pricing: IPricingService,
                        logger: Logger,
                        ...extraProviders: any[]
                    ) => {
                        const moduleOptions = await options.useFactory(...extraProviders);
                        const { bridgeHub, sharedBridge, stateTransitionManager } =
                            moduleOptions.contracts;
                        return new L1MetricsService(
                            bridgeHub,
                            sharedBridge,
                            stateTransitionManager,
                            evmProviderService,
                            pricing,
                            logger,
                        );
                    },
                    inject: [
                        EvmProviderService,
                        PRICING_PROVIDER,
                        Logger,
                        ...(options.inject || []),
                    ],
                },
                Logger,
            ],
            exports: [L1MetricsService],
        };
    }
}
