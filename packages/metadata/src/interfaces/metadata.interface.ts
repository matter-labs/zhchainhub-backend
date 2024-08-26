import { Token, TokenType, ZKChainMetadata } from "@zkchainhub/shared";

/**
 * Represents a metadata provider that retrieves chains and tokens metadata.
 */
export interface IMetadataProvider {
    /**
     * Retrieves the metadata for ZK chains of the ecosystem
     *
     * @returns A promise that resolves to the metadata of ZK chains.
     *
     * @throws {FetchError}
     * If there is an issue with the network request.
     *
     *
     * @throws {InvalidSchema}
     * If the response data is invalid or cannot be parsed.
     */
    getChainsMetadata(): Promise<ZKChainMetadata>;

    /**
     * Retrieves metadata for tokens of the ecosystem
     *
     * @returns A promise that resolves to an array of token metadata.
     *
     * @throws {FetchError} If there is an issue with the network request.
     * @throws {InvalidSchema} If the response data is invalid or cannot be parsed.
     */
    getTokensMetadata(): Promise<Token<TokenType>[]>;
}
