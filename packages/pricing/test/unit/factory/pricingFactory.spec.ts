import { describe, expect, it } from "vitest";

import {
    CoingeckoProvider,
    DummyPricingProvider,
    PricingConfig,
    PricingProviderFactory,
} from "../../../src/internal.js";

describe("PricingProviderFactory", () => {
    it("create a DummyPricingProvider", () => {
        const options: PricingConfig<"dummy"> = {
            source: "dummy",
            dummyPrice: 1,
        };

        const pricingProvider = PricingProviderFactory.create(options);

        expect(pricingProvider).toBeInstanceOf(DummyPricingProvider);
        expect(pricingProvider["dummyPrice"]).toBe(1);
    });

    it("create a CoingeckoProvider", () => {
        const options: PricingConfig<"coingecko"> = {
            source: "coingecko",
            apiKey: "some-api-key",
            apiBaseUrl: "some-base-url",
            apiType: "demo",
        };

        const pricingProvider = PricingProviderFactory.create(options, {
            logger: {} as any,
            cache: {} as any,
        });

        expect(pricingProvider).toBeInstanceOf(CoingeckoProvider);
        expect(pricingProvider["options"]).toEqual({
            apiKey: "some-api-key",
            apiBaseUrl: "some-base-url",
            apiType: "demo",
        });
    });

    it("throws if cache instance is not provided for CoingeckoProvider", () => {
        const options: PricingConfig<"coingecko"> = {
            source: "coingecko",
            apiKey: "some-api-key",
            apiBaseUrl: "some-base-url",
            apiType: "demo",
        };

        expect(() =>
            PricingProviderFactory.create(options, {
                logger: {} as any,
            }),
        ).toThrowError("Missing dependencies");
    });

    it("throws if logger instance is not provided for CoingeckoProvider", () => {
        const options: PricingConfig<"coingecko"> = {
            source: "coingecko",
            apiKey: "some-api-key",
            apiBaseUrl: "some-base-url",
            apiType: "demo",
        };

        expect(() =>
            PricingProviderFactory.create(options, {
                cache: {} as any,
            }),
        ).toThrowError("Missing dependencies");
    });

    it("should throw an error for invalid pricing source", () => {
        const options = {
            source: "invalid",
        };

        expect(() => {
            PricingProviderFactory.create(options as any);
        }).toThrowError("Invalid pricing source");
    });
});
