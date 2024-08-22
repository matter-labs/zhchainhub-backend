import { inspect } from "util";
import { caching } from "cache-manager";

import { L1MetricsService } from "@zkchainhub/metrics";
import { CoingeckoProvider } from "@zkchainhub/pricing";
import { Logger } from "@zkchainhub/shared";

import { EvmProvider } from "../../../packages/chain-providers/dist/src/index.js";
import { App } from "./app.js";
import { config } from "./common/config/index.js";
import { MetricsController, MetricsRouter } from "./metrics/index.js";

const logger = Logger.getInstance();

const main = async (): Promise<void> => {
    const memoryCache = await caching("memory", {
        max: 150, // maximum number of items to store
        ttl: config.pricing.cacheOptions.ttl * 1000 /*milliseconds*/,
    });

    const evmProvider = new EvmProvider(config.l1.rpcUrls, config.l1.chain, logger);
    const pricingProvider = new CoingeckoProvider(
        {
            apiBaseUrl: config.pricing.pricingOptions.apiBaseUrl,
            apiKey: config.pricing.pricingOptions.apiKey,
            apiType: config.pricing.pricingOptions.apiType,
        },
        memoryCache,
        logger,
    );
    const l1MetricsService = new L1MetricsService(
        config.bridgeHubAddress,
        config.sharedBridgeAddress,
        config.stateTransitionManagerAddresses,
        evmProvider,
        pricingProvider,
        logger,
    );
    const metricsController = new MetricsController(l1MetricsService, logger);
    const metricsRouter = new MetricsRouter(metricsController, logger);

    const app = new App(config, [metricsRouter], logger);

    app.listen();
};

process.on("unhandledRejection", (reason, p) => {
    logger.error(`Unhandled Rejection at: \n${inspect(p, undefined, 100)}, \nreason: ${reason}`);
});

process.on("uncaughtException", (error: Error) => {
    logger.error(`An uncaught exception occurred: ${error}\n` + `Exception origin: ${error.stack}`);
});

main().catch((err) => {
    logger.error(`Caught error in main handler: ${err}`);
});
