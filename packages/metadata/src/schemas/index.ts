import { z } from "zod";

import { Address } from "@zkchainhub/shared";

export const TokenSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    type: z.union([z.literal("erc20"), z.literal("native")]),
    contractAddress: z
        .custom<Address>((val) => {
            return typeof val === "string" && /^0x[a-fA-F0-9]{40}$/.test(val);
        }, "Invalid Ethereum address")
        .nullable(),
    decimals: z.number(),
    imageUrl: z.string().optional(),
});

export const ChainSchema = z.object({
    chainId: z.number().positive(),
    name: z.string(),
    iconUrl: z.string().url().optional(),
    publicRpcs: z.array(z.string().url()).default([]),
    explorerUrl: z.string().url().optional(),
    launchDate: z.number().positive(),
    chainType: z.union([z.literal("Rollup"), z.literal("Validium")]),
    baseToken: TokenSchema,
});
