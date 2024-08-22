import { Token, tokens, TokenType, ZKChainMetadata, zkChainsMetadata } from "@zkchainhub/shared";

import { IMetadataProvider } from "../interfaces/index.js";

export class StaticMetadataProvider implements IMetadataProvider {
    async getChainsMetadata(): Promise<ZKChainMetadata> {
        return structuredClone(zkChainsMetadata);
    }
    async getTokensMetadata(): Promise<Token<TokenType>[]> {
        return Array.from(tokens);
    }
}
