import { Token, TokenType } from "../internal.js";

export const isNativeToken = (token: Token<TokenType>): token is Token<"native"> =>
    token.type === "native";

export const isErc20Token = (token: Token<TokenType>): token is Token<"erc20"> =>
    token.type === "erc20";
