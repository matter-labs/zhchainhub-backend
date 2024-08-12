import { Token, TokenType } from "@zkchainhub/shared/types";

export const isNativeToken = (token: Token<TokenType>): token is Token<"native"> =>
    token.type === "native";
