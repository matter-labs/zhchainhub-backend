import { inspect } from "util";
import { caching } from "cache-manager";

import { EvmProvider, ZKChainProvider } from "@zkchainhub/chain-providers";
import { MetadataProviderFactory } from "@zkchainhub/metadata";
import { L1MetricsService, L2MetricsService } from "@zkchainhub/metrics";
import { PricingProviderFactory } from "@zkchainhub/pricing";
import { ChainId, Logger } from "@zkchainhub/shared";

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

    const pricingProvider = PricingProviderFactory.create(config.pricing, {
        cache: memoryCache,
        logger,
    });

    const metadataProvider = MetadataProviderFactory.create(config.metadata, {
        logger,
        cache: memoryCache,
    });

    const l1MetricsService = new L1MetricsService(
        config.bridgeHubAddress,
        config.sharedBridgeAddress,
        config.stateTransitionManagerAddresses,
        evmProvider,
        pricingProvider,
        metadataProvider,
        logger,
    );

    const l2ChainsConfigMap = config.l2;
    const l2MetricsMap = new Map<ChainId, L2MetricsService>();

    for (const [chainId, rpcUrls] of Object.entries(l2ChainsConfigMap)) {
        const provider = new ZKChainProvider(rpcUrls, logger);
        const metricsService = new L2MetricsService(provider, logger);
        l2MetricsMap.set(BigInt(chainId), metricsService);
    }

    const metricsController = new MetricsController(
        l1MetricsService,
        l2MetricsMap,
        metadataProvider,
        logger,
    );
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
