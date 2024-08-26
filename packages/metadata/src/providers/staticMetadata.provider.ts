import { Token, tokens, TokenType, ZKChainMetadata, zkChainsMetadata } from "@zkchainhub/shared";

import { IMetadataProvider } from "../interfaces/index.js";

/**
 * Represents a provider that retrieves metadata from static data of mainnet.
 */
export class StaticMetadataProvider implements IMetadataProvider {
    /** @inheritdoc */
    async getChainsMetadata(): Promise<ZKChainMetadata> {
        return structuredClone(zkChainsMetadata);
    }

    /** @inheritdoc */
    async getTokensMetadata(): Promise<Token<TokenType>[]> {
        return Array.from(tokens);
    }
}
