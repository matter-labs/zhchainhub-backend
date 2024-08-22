import { Token, TokenType, ZKChainMetadata } from "@zkchainhub/shared";

export interface IMetadataService {
    getChainsMetadata(): Promise<ZKChainMetadata>;
    getTokensMetadata(): Promise<Token<TokenType>[]>;
}
