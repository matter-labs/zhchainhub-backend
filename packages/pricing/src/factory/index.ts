import { Cache, ILogger } from "@zkchainhub/shared";

import {
    CoingeckoProvider,
    DummyPricingProvider,
    IPricingProvider,
    PricingConfig,
    PricingProvider,
} from "../internal.js";

export class PricingProviderFactory {
    static create(
        options: PricingConfig<PricingProvider>,
        deps?: {
            logger?: ILogger;
            cache?: Cache;
        },
    ): IPricingProvider {
        let pricingProvider: IPricingProvider;

        switch (options.source) {
            case "dummy":
                pricingProvider = new DummyPricingProvider(options.dummyPrice);
                break;
            case "coingecko":
                if (!deps?.cache || !deps?.logger) {
                    throw new Error("Missing dependencies");
                }
                pricingProvider = new CoingeckoProvider(
                    {
                        apiBaseUrl: options.apiBaseUrl,
                        apiKey: options.apiKey,
                        apiType: options.apiType,
                    },
                    deps.cache,
                    deps.logger,
                );
                break;
            default:
                throw new Error("Invalid pricing source");
        }

        return pricingProvider;
    }
}
