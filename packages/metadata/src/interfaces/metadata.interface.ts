import { Token, TokenType, ZKChainMetadata } from "@zkchainhub/shared";

export interface IMetadataProvider {
    getChainsMetadata(): Promise<ZKChainMetadata>;
    getTokensMetadata(): Promise<Token<TokenType>[]>;
}
