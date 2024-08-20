import { CacheModuleOptions } from "@nestjs/cache-manager";
import { ModuleMetadata, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { IPricingOptions } from "@zkchainhub/pricing/interfaces";

// symbols

/**
 * Represents the symbol used to inject the pricing service interface.
 */

export const PRICING_PROVIDER = Symbol("IPricingService");

/**
 * Represents the symbol used to inject the pricing service options interface
 */
export const PRICING_OPTIONS = Symbol("PRICING_OPTIONS");

// types

export type PricingProvider = "coingecko";

export type PricingProviderOptions<P extends PricingProvider> = P extends "coingecko"
    ? CoingeckoOptions
    : never;

// interfaces
export interface CoingeckoOptions extends IPricingOptions {
    provider: "coingecko";
    apiKey: string;
    apiBaseUrl: string;
    apiType: "demo" | "pro";
}

/**
 * Represents the options for the PricingModule.
 */
export interface PricingModuleOptions<
    CacheConfig extends Record<string, any>,
    P extends PricingProvider,
> {
    cacheOptions: CacheModuleOptions<CacheConfig>;
    pricingOptions: PricingProviderOptions<P>;
}

export interface PricingModuleAsyncOptions<P extends PricingProvider>
    extends Pick<ModuleMetadata, "imports"> {
    useFactory: (
        config: ConfigService<{ pricing: PricingModuleOptions<any, P> }, true>,
        ...args: any[]
    ) =>
        | Promise<Pick<PricingModuleOptions<any, P>, "pricingOptions">>
        | Pick<PricingModuleOptions<any, P>, "pricingOptions">;
    inject?: any[];
    extraProviders?: Provider[];
}
