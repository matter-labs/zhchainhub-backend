import dotenv from "dotenv";
import { Address, isAddress } from "viem";
import { mainnet, zksync } from "viem/chains";
import { z } from "zod";

import { Logger } from "@zkchainhub/shared";

dotenv.config();

const logger = Logger.getInstance();

const addressArraySchema = z
    .string()
    .transform((str) => str.split(","))
    .refine((addresses) => addresses.every((address) => isAddress(address)), {
        message: "Must be a comma-separated list of valid Addresses",
    });
const addressSchema = z.string().refine((address) => isAddress(address), {
    message: "Must be a valid Address",
});

const urlArraySchema = z
    .string()
    .transform((str) => str.split(","))
    .refine((urls) => urls.every((url) => z.string().url().safeParse(url).success), {
        message: "Must be a comma-separated list of valid URLs",
    });

const validationSchema = z.object({
    PORT: z.coerce.number().positive().default(3000),
    BRIDGE_HUB_ADDRESS: addressSchema,
    SHARED_BRIDGE_ADDRESS: addressSchema,
    STATE_MANAGER_ADDRESSES: addressArraySchema,
    L1_RPC_URLS: urlArraySchema,
    L2_RPC_URLS: z
        .union([z.literal(""), urlArraySchema])
        .optional()
        .transform((val) => {
            if (val === undefined || val === "") return [];
            return val;
        }),
    COINGECKO_API_KEY: z.string(),
    COINGECKO_BASE_URL: z.string().url().default("https://api.coingecko.com/api/v3/"),
    COINGECKO_API_TYPE: z.enum(["demo", "pro"]).default("demo"),
    CACHE_TTL: z.coerce.number().positive().default(60),
});

const env = validationSchema.safeParse(process.env);

if (!env.success) {
    logger.error(env.error.issues.map((issue) => JSON.stringify(issue)).join("\n"));
    process.exit(1);
}

const { data: envData } = env;

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
} as const;

export type ConfigType = typeof config;
