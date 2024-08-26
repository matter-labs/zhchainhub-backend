import { existsSync, readFileSync } from "fs";
import { z } from "zod";

import {
    ILogger,
    Token,
    TokenType,
    ZKChainMetadata,
    ZKChainMetadataItem,
} from "@zkchainhub/shared";

import { FileNotFound, IMetadataProvider, InvalidSchema } from "../internal.js";
import { ChainSchema, TokenSchema } from "../schemas/index.js";

export const LOCALFILE_METADATA_PREFIX = "local-metadata";

/**
 * Represents a provider that retrieves metadata from local files.
 * Note: Files are read only once and saved to instance variables.
 */
export class LocalFileMetadataProvider implements IMetadataProvider {
    private readonly chainMetadata: ZKChainMetadata;
    private readonly tokenMetadata: Token<TokenType>[];

    /**
     * Constructs a new instance of the LocalFileMetadataProvider class.
     * @param tokenJsonPath The path to the token JSON file.
     * @param chainJsonPath The path to the chain JSON file.
     * @param logger The logger instance.
     * @throws {FileNotFound} if any of the files is not found.
     */
    constructor(
        private readonly tokenJsonPath: string,
        private readonly chainJsonPath: string,
        private readonly logger: ILogger,
    ) {
        if (!existsSync(tokenJsonPath)) {
            throw new FileNotFound(tokenJsonPath);
        }

        if (!existsSync(chainJsonPath)) {
            throw new FileNotFound(chainJsonPath);
        }

        this.tokenMetadata = this.readAndParseTokenMetadata();
        this.chainMetadata = this.readAndParseChainMetadata();
    }

    /** @inheritdoc */
    async getChainsMetadata(): Promise<ZKChainMetadata> {
        return Promise.resolve(this.chainMetadata);
    }

    readAndParseChainMetadata() {
        const jsonData = readFileSync(this.chainJsonPath, "utf-8");
        const parsed = JSON.parse(jsonData);

        const validatedData = z.array(ChainSchema).safeParse(parsed);

        if (!validatedData.success) {
            this.logger.error(`Invalid ZKChains metadata: ${validatedData.error.errors}`);
            throw new InvalidSchema("Invalid ZKChains metadata");
        }

        return validatedData.data.reduce((acc, chain) => {
            const { chainId, ...rest } = chain;
            const chainIdBn = BigInt(chainId);
            acc.set(chainIdBn, { ...rest, chainId: chainIdBn });
            return acc;
        }, new Map<bigint, ZKChainMetadataItem>());
    }

    /** @inheritdoc */
    async getTokensMetadata(): Promise<Token<TokenType>[]> {
        return Promise.resolve(this.tokenMetadata);
    }

    readAndParseTokenMetadata() {
        const jsonData = readFileSync(this.tokenJsonPath, "utf-8");
        const parsed = JSON.parse(jsonData);

        const validatedData = z.array(TokenSchema).safeParse(parsed);

        if (!validatedData.success) {
            this.logger.error(`Invalid Tokens metadata: ${validatedData.error.errors}`);
            throw new InvalidSchema("Invalid Tokens metadata");
        }

        return validatedData.data;
    }
}
