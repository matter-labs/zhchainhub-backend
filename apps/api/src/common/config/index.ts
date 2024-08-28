import dotenv from "dotenv";
import { Address } from "viem";
import { mainnet, zksync } from "viem/chains";

import { MetadataConfig } from "@zkchainhub/metadata";
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

export const config = {
    port: envData.PORT,
    l1: {
        rpcUrls: envData.L1_RPC_URLS,
        chain: mainnet,
    },
    l2:
        envData.L2_RPC_URLS.length > 0
            ? {
                  rpcUrls: envData.L2_RPC_URLS,
                  chain: zksync,
              }
            : undefined,
    bridgeHubAddress: envData.BRIDGE_HUB_ADDRESS as Address,
    sharedBridgeAddress: envData.SHARED_BRIDGE_ADDRESS as Address,
    stateTransitionManagerAddresses: envData.STATE_MANAGER_ADDRESSES as Address[],
    pricing: {
        cacheOptions: {
            ttl: envData.CACHE_TTL,
        },
        pricingOptions: {
            apiKey: envData.COINGECKO_API_KEY,
            apiBaseUrl: envData.COINGECKO_BASE_URL,
            apiType: envData.COINGECKO_API_TYPE,
        },
    },
    metadata: createMetadataConfig(envData),
} as const;

export type ConfigType = typeof config;
