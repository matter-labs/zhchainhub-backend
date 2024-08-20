import { Cache, CacheModule } from "@nestjs/cache-manager";
import { DynamicModule, Logger, Module, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
    CoingeckoOptions,
    PRICING_OPTIONS,
    PRICING_PROVIDER,
    PricingModuleAsyncOptions,
    PricingModuleOptions,
    PricingProvider,
} from "@zkchainhub/pricing/configuration";
import { IPricingService } from "@zkchainhub/pricing/interfaces";
import { LoggerModule } from "@zkchainhub/shared";

import { CoingeckoService } from "./services";

const coingeckoPricingServiceFactory = (options: CoingeckoOptions): [Provider, Provider[]] => {
    return [
        {
            provide: PRICING_PROVIDER,
            useClass: CoingeckoService,
        },
        [
            {
                provide: PRICING_OPTIONS,
                useValue: options,
            },
            Logger,
        ],
    ];
};

const pricingProviderFactory = <P extends PricingProvider>(
    options: PricingModuleAsyncOptions<P>,
) => {
    return {
        provide: PRICING_PROVIDER,
        useFactory: async (
            cache: Cache,
            config: ConfigService<{ pricing: PricingModuleOptions<any, P> }, true>,
            logger: Logger,
        ) => {
            const opts = await options.useFactory(config);
            const { provider } = opts.pricingOptions;
            let impl: IPricingService | undefined = undefined;
            if (provider === "coingecko") {
                impl = new CoingeckoService(opts.pricingOptions, cache, logger);
            }

            if (!impl) throw new Error("Error initializing pricing module");

            return impl;
        },
        inject: [Cache, ConfigService, Logger],
    };
};

@Module({})
export class PricingModule {
    static register<CacheConfig extends Record<string, any>, T extends PricingProvider>(
        options: PricingModuleOptions<CacheConfig, T>,
    ): DynamicModule {
        let pricingProvider: Provider | undefined,
            additionalProviders: Provider[] = [];
        if (options.pricingOptions.provider === "coingecko") {
            const res = coingeckoPricingServiceFactory(options.pricingOptions);
            pricingProvider = res[0];
            additionalProviders = res[1];
        }

        if (!pricingProvider) throw new Error("Error initializing pricing module");
        return {
            module: PricingModule,
            imports: [LoggerModule, CacheModule.register(options.cacheOptions)],
            providers: [pricingProvider, ...additionalProviders],
            exports: [PRICING_PROVIDER],
        };
    }

    static registerAsync<P extends PricingProvider>(
        options: PricingModuleAsyncOptions<P>,
    ): DynamicModule {
        return {
            module: PricingModule,
            imports: options.imports || [],
            providers: [...(options.extraProviders || []), pricingProviderFactory(options)],
            exports: [PRICING_PROVIDER],
        };
    }
}
