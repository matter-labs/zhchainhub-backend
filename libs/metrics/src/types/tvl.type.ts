import { Token, TokenType } from "@zkchainhub/shared";

export type AssetTvl = Omit<Token<TokenType>, "coingeckoId"> & {
    amount: string;
    amountUsd: string;
    price: string;
};
