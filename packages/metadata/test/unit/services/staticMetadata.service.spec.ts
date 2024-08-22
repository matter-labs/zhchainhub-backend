import { beforeEach, describe, expect, expectTypeOf, it } from "vitest";

import { Token, TokenType, ZKChainMetadata } from "@zkchainhub/shared";

import { StaticMetadataService } from "../../../src/internal.js";

describe("StaticMetadataService", () => {
    let metadataService: StaticMetadataService;

    beforeEach(() => {
        metadataService = new StaticMetadataService();
    });

    describe("getChainsMetadata", () => {
        it("should return the ZKChainMetadata", async () => {
            const result = await metadataService.getChainsMetadata();
            expect(result).toBeDefined();
            expectTypeOf(result).toEqualTypeOf<ZKChainMetadata>();
        });
    });

    describe("getTokensMetadata", () => {
        it("should return an array of Token objects", async () => {
            const result = await metadataService.getTokensMetadata();
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expectTypeOf(result).toEqualTypeOf<Token<TokenType>[]>();
        });
    });
});
