import { DynamicModule, Logger, Module, ModuleMetadata, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Chain } from "viem";

import { LoggerModule } from "@zkchainhub/shared";

import { EvmProviderService } from "./providers";
import { ZKChainProviderService } from "./providers/zkChainProvider.service";

export interface ProvidersModuleOptions {
    l1: {
        rpcUrls: string[];
        chain: Chain;
    };
    l2?: {
        rpcUrls: string[];
        chain: Chain;
    };
}

interface ProvidersModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
    useFactory: (
        config: ConfigService<ProvidersModuleOptions, true>,
        ...args: any[]
    ) => Promise<ProvidersModuleOptions> | ProvidersModuleOptions;
    inject?: any[];
    extraProviders?: Provider[];
}

const evmProviderFactory = (options: ProvidersModuleOptions["l1"]) => {
    return {
        provide: EvmProviderService,
        useFactory: (logger: Logger) => {
            return new EvmProviderService(options.rpcUrls, options.chain, logger);
        },
        inject: [Logger],
    };
};
const zkProviderFactory = (options: ProvidersModuleOptions["l2"]) => {
    if (!options) throw new Error("Error initializazing zkProvider");

    return {
        provide: ZKChainProviderService,
        useFactory: (logger: Logger) => {
            return new ZKChainProviderService(options.rpcUrls, options.chain, logger);
        },
        inject: [Logger],
    };
};

/**
 * Module for managing provider services.
 * This module exports Services for interacting with EVM-based blockchains.
 */
@Module({})
export class ProvidersModule {
    static register(options: ProvidersModuleOptions): DynamicModule {
        if (options.l2) {
            return {
                module: ProvidersModule,
                imports: [LoggerModule],
                providers: [evmProviderFactory(options.l1), zkProviderFactory(options.l2), Logger],
                exports: [EvmProviderService, ZKChainProviderService],
            };
        } else {
            return {
                module: ProvidersModule,
                imports: [LoggerModule],
                providers: [evmProviderFactory(options.l1), Logger],
                exports: [EvmProviderService],
            };
        }
    }

    static registerAsync(options: ProvidersModuleAsyncOptions): DynamicModule {
        const providers: Provider[] = [
            {
                provide: EvmProviderService,
                useFactory: async (
                    logger: Logger,
                    config: ConfigService<ProvidersModuleOptions, true>,
                ) => {
                    const opts = await options.useFactory(config);
                    return new EvmProviderService(opts.l1.rpcUrls, opts.l1.chain, logger);
                },
                inject: [Logger, ConfigService],
            },
            Logger,
        ];

        if (options.extraProviders) {
            providers.push(...options.extraProviders);
        }

        providers.push({
            provide: ZKChainProviderService,
            useFactory: async (
                logger: Logger,
                config: ConfigService<ProvidersModuleOptions, true>,
            ) => {
                const opts = await options.useFactory(config);
                if (opts.l2) {
                    return new ZKChainProviderService(opts.l2.rpcUrls, opts.l2.chain, logger);
                }
                return null;
            },
            inject: [Logger, ConfigService],
        });

        return {
            module: ProvidersModule,
            imports: options.imports || [],
            providers,
            exports: [
                EvmProviderService,
                ...(options.extraProviders || []),
                ZKChainProviderService,
            ],
        };
    }
}
