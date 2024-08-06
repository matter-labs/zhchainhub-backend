import { TokenUnion } from "@zkchainhub/shared/tokens/tokens";

export type AssetTvl = Omit<TokenUnion, "coingeckoId"> & {
    amount: string;
    amountUsd: string;
    price: string;
};
