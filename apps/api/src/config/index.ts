import { Address } from "abitype";
import Joi from "joi";
import { mainnet, zkSync } from "viem/chains";

export const config = () => ({
    l1: {
        rpcUrls: process.env.L1_RPC_URLS!.split(","),
        chain: mainnet,
    },
    l2: {
        rpcUrls: process.env.L2_RPC_URLS!.split(","),
        chain: zkSync,
    },
    bridgeHubAddress: "0x303a465B659cBB0ab36eE643eA362c509EEb5213" as Address,
    sharedBridgeAddress: "0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB" as Address,
    stateTransitionManagerAddresses: ["0xc2eE6b6af7d616f6e27ce7F4A451Aedc2b0F5f5C"] as Address[],
    pricing: {
        cacheOptions: {
            ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 60,
        },
        pricingOptions: {
            apiKey: process.env.COINGECKO_API_KEY,
            apiBaseUrl: process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3/",
            apiType: process.env.COINGECKO_API_TYPE || "demo",
        },
    },
});

export type ConfigType = ReturnType<typeof config>;

export const validationSchema = Joi.object({
    L1_RPC_URLS: Joi.string()
        .uri()
        .required()
        .custom((value, helpers) => {
            // Ensure it's a comma-separated list of valid URLs
            const urls = value.split(",");
            for (const url of urls) {
                if (!Joi.string().uri().validate(url).error) continue;
                return helpers.message({ custom: `"${url}" is not a valid URL` });
            }
            return value;
        }),
    L2_RPC_URLS: Joi.string()
        .uri()
        .required()
        .custom((value, helpers) => {
            // Ensure it's a comma-separated list of valid URLs
            const urls = value.split(",");
            for (const url of urls) {
                if (!Joi.string().uri().validate(url).error) continue;
                return helpers.message({ custom: `"${url}" is not a valid URL` });
            }
            return value;
        }),
    COINGECKO_API_KEY: Joi.string().required(),
    COINGECKO_BASE_URL: Joi.string().uri().default("https://api.coingecko.com/api/v3/"),
    COINGECKO_API_TYPE: Joi.string().valid("demo", "pro").default("demo"),
    CACHE_TTL: Joi.number().positive().default(60),
});
