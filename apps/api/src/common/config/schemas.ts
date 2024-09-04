import { isAddress } from "viem";
import { z } from "zod";

const stringToJSONSchema = z.string().transform((str, ctx): z.infer<ReturnType<typeof Object>> => {
    try {
        return JSON.parse(str);
    } catch (e) {
        ctx.addIssue({ code: "custom", message: "Invalid JSON" });
        return z.NEVER;
    }
});

const addressArraySchema = z
    .string()
    .transform((str) => str.split(","))
    .refine((addresses) => addresses.every((address) => isAddress(address)), {
        message: "Must be a comma-separated list of valid Addresses",
    });
const addressSchema = z.string().refine((address) => isAddress(address), {
    message: "Must be a valid Address",
});

const urlArraySchema = z.array(z.string().url());

const urlArrayMapSchema = z.record(
    z.union([z.coerce.number().int(), z.string().regex(/^\d+$/)]), // key: number or string number
    urlArraySchema,
);

const baseSchema = z.object({
    PORT: z.coerce.number().positive().default(3000),
    BRIDGE_HUB_ADDRESS: addressSchema,
    SHARED_BRIDGE_ADDRESS: addressSchema,
    STATE_MANAGER_ADDRESSES: addressArraySchema,
    ENVIRONMENT: z.enum(["mainnet", "testnet", "local"]).default("mainnet"),
    L1_RPC_URLS: stringToJSONSchema.pipe(urlArraySchema),
    L2_RPC_URLS_MAP: stringToJSONSchema.pipe(urlArrayMapSchema).default("{}"),
    PRICING_SOURCE: z.enum(["dummy", "coingecko"]).default("dummy"),
    DUMMY_PRICE: z.coerce.number().optional(),
    COINGECKO_API_KEY: z.string().optional(),
    COINGECKO_BASE_URL: z.string().url().default("https://api.coingecko.com/api/v3/"),
    COINGECKO_API_TYPE: z.enum(["demo", "pro"]).default("demo"),
    CACHE_TTL: z.coerce.number().positive().default(60),
    METADATA_SOURCE: z.enum(["github", "local", "static"] as const),
    METADATA_TOKEN_URL: z.string().url().optional(),
    METADATA_CHAIN_URL: z.string().url().optional(),
    METADATA_TOKEN_JSON_PATH: z.string().optional(),
    METADATA_CHAIN_JSON_PATH: z.string().optional(),
});

const githubSchema = baseSchema
    .extend({
        METADATA_SOURCE: z.literal("github"),
        METADATA_TOKEN_URL: z.string().url(),
        METADATA_CHAIN_URL: z.string().url(),
    })
    .omit({
        METADATA_TOKEN_JSON_PATH: true,
        METADATA_CHAIN_JSON_PATH: true,
    });

const localSchema = baseSchema
    .extend({
        METADATA_SOURCE: z.literal("local"),
        METADATA_TOKEN_JSON_PATH: z.string(),
        METADATA_CHAIN_JSON_PATH: z.string(),
    })
    .omit({
        METADATA_TOKEN_URL: true,
        METADATA_CHAIN_URL: true,
    });

const staticSchema = baseSchema
    .extend({
        METADATA_SOURCE: z.literal("static"),
    })
    .omit({
        METADATA_TOKEN_URL: true,
        METADATA_CHAIN_URL: true,
        METADATA_TOKEN_JSON_PATH: true,
        METADATA_CHAIN_JSON_PATH: true,
    });

const dummyPricingSchema = baseSchema
    .extend({
        PRICING_SOURCE: z.literal("dummy"),
        DUMMY_PRICE: z.coerce.number().optional(),
    })
    .omit({
        COINGECKO_API_KEY: true,
        COINGECKO_BASE_URL: true,
        COINGECKO_API_TYPE: true,
    });

const coingeckoPricingSchema = baseSchema
    .extend({
        PRICING_SOURCE: z.literal("coingecko"),
        COINGECKO_API_KEY: z.string(),
        COINGECKO_BASE_URL: z.string().url().default("https://api.coingecko.com/api/v3/"),
        COINGECKO_API_TYPE: z.enum(["demo", "pro"]).default("demo"),
    })
    .omit({
        DUMMY_PRICE: true,
    });

export const validationSchema = z
    .discriminatedUnion("METADATA_SOURCE", [githubSchema, localSchema, staticSchema])
    .and(z.discriminatedUnion("PRICING_SOURCE", [dummyPricingSchema, coingeckoPricingSchema]));
