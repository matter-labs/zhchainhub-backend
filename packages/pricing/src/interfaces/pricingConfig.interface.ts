import { PricingProvider } from "./pricing.interface.js";

export interface DummyPricingConfig {
    source: "dummy";
    dummyPrice?: number;
}

export interface CoingeckoPricingConfig {
    source: "coingecko";
    apiKey: string;
    apiBaseUrl: string;
    apiType: "demo" | "pro";
}

export type PricingConfig<Source extends PricingProvider> = Source extends "dummy"
    ? DummyPricingConfig
    : Source extends "coingecko"
    ? CoingeckoPricingConfig
    : never;
