import { Token, tokens, TokenType, ZKChainMetadata, zkChainsMetadata } from "@zkchainhub/shared";

import { IMetadataService } from "../interfaces/index.js";

export class StaticMetadataService implements IMetadataService {
    async getChainsMetadata(): Promise<ZKChainMetadata> {
        return structuredClone(zkChainsMetadata);
    }
    async getTokensMetadata(): Promise<Token<TokenType>[]> {
        return Array.from(tokens);
    }
}
