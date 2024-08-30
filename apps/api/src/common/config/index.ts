import dotenv from "dotenv";
import { Address } from "viem";
import { localhost, mainnet, sepolia } from "viem/chains";

import { MetadataConfig } from "@zkchainhub/metadata";
import { PricingConfig } from "@zkchainhub/pricing";
import { Logger } from "@zkchainhub/shared";

import { validationSchema } from "./schemas.js";

dotenv.config();

const logger = Logger.getInstance();

const env = validationSchema.safeParse(process.env);

if (!env.success) {
    logger.error(env.error.issues.map((issue) => JSON.stringify(issue)).join("\n"));
    process.exit(1);
}

const { data: envData } = env;

const createMetadataConfig = (
    env: typeof envData,
): MetadataConfig<typeof envData.METADATA_SOURCE> => {
    switch (env.METADATA_SOURCE) {
        case "github":
            return {
                source: "github",
                tokenUrl: env.METADATA_TOKEN_URL,
                chainUrl: env.METADATA_CHAIN_URL,
            };
        case "local":
            return {
                source: "local",
                tokenJsonPath: env.METADATA_TOKEN_JSON_PATH,
                chainJsonPath: env.METADATA_CHAIN_JSON_PATH,
            };
        case "static":
            return { source: "static" };
    }
};

const createPricingConfig = (env: typeof envData): PricingConfig<typeof env.PRICING_SOURCE> => {
    switch (env.PRICING_SOURCE) {
        case "dummy":
            return {
                source: "dummy",
                dummyPrice: env.DUMMY_PRICE,
            };
        case "coingecko":
            return {
                source: "coingecko",
                apiKey: env.COINGECKO_API_KEY,
                apiBaseUrl: env.COINGECKO_BASE_URL,
                apiType: env.COINGECKO_API_TYPE,
            };
    }
};

const getChain = (environment: "mainnet" | "testnet" | "local") => {
    switch (environment) {
        case "mainnet":
            return mainnet;
        case "testnet":
            return sepolia;
        case "local":
            return localhost;
    }
};

export const config = {
    port: envData.PORT,
    environment: envData.ENVIRONMENT,

    l1: {
        rpcUrls: envData.L1_RPC_URLS,
        chain: getChain(envData.ENVIRONMENT),
    },
    bridgeHubAddress: envData.BRIDGE_HUB_ADDRESS as Address,
    sharedBridgeAddress: envData.SHARED_BRIDGE_ADDRESS as Address,
    stateTransitionManagerAddresses: envData.STATE_MANAGER_ADDRESSES as Address[],
    pricing: {
        cacheOptions: {
            ttl: envData.CACHE_TTL,
        },
        ...createPricingConfig(envData),
    },
    metadata: createMetadataConfig(envData),
} as const;

export type ConfigType = typeof config;
