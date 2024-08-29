import { Address } from "abitype";

export type TokenType = "erc20" | "native";
export type Token<T extends TokenType> = {
    name: string;
    symbol: string;
    type: T;
    contractAddress: T extends "erc20" ? Address : null;
    decimals: number;
    imageUrl?: string;
};
