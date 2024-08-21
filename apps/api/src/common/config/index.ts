import dotenv from "dotenv";
import { Address } from "viem";
import { mainnet, zksync } from "viem/chains";
import { z } from "zod";

import { Logger } from "@zkchainhub/shared";

dotenv.config();

const logger = Logger.getInstance();

const urlArraySchema = z
    .string()
    .transform((str) => str.split(","))
    .refine((urls) => urls.every((url) => z.string().url().safeParse(url).success), {
        message: "Must be a comma-separated list of valid URLs",
    });

const validationSchema = z.object({
    PORT: z.coerce.number().positive().default(3000),
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
    bridgeHubAddress: "0x303a465B659cBB0ab36eE643eA362c509EEb5213" as Address,
    sharedBridgeAddress: "0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB" as Address,
    stateTransitionManagerAddresses: ["0xc2eE6b6af7d616f6e27ce7F4A451Aedc2b0F5f5C"] as Address[],
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
