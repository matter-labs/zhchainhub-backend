import { Token, TokenType, ZKChainMetadata } from "@zkchainhub/shared";

import { IMetadataProvider } from "../interfaces/index.js";

export class GithubMetadataProvider implements IMetadataProvider {
    async getChainsMetadata(): Promise<ZKChainMetadata> {
        //TODO: Implement this method
        throw new Error("Method not implemented.");
    }

    async getTokensMetadata(): Promise<Token<TokenType>[]> {
        //TODO: Implement this method
        throw new Error("Method not implemented.");
    }
}
