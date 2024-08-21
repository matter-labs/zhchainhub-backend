import { Token, TokenType } from "../internal.js";

export const isNativeToken = (token: Token<TokenType>): token is Token<"native"> =>
    token.type === "native";
