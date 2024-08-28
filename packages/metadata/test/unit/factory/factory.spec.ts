import * as fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Cache, ILogger } from "@zkchainhub/shared";

import {
    GithubMetadataProvider,
    LocalFileMetadataProvider,
    MetadataConfig,
    MetadataProviderFactory,
    MetadataSource,
    StaticMetadataProvider,
} from "../../../src/internal.js";
import { mockChainData, mockTokenData } from "../../fixtures/metadata.fixtures.js";

// Mock the file system functions
vi.mock("fs", () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
}));

describe("MetadataProviderFactory", () => {
    let logger: ILogger;
    let cache: Cache;

    beforeEach(() => {
        logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        };
        cache = {
            store: {} as any,
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
            reset: vi.fn(),
        };
    });

    describe("create", () => {
        it("create a GithubMetadataProvider when metadata source is 'github' and dependencies are provided", () => {
            const metadata: MetadataConfig<MetadataSource> = {
                source: "github",
                tokenUrl: "https://github.com/token",
                chainUrl: "https://github.com/chain",
            };
            const deps = {
                logger,
                cache,
            };

            const provider = MetadataProviderFactory.create(metadata, deps);

            expect(provider).toBeInstanceOf(GithubMetadataProvider);
            expect(provider).toHaveProperty("tokenJsonUrl", "https://github.com/token");
            expect(provider).toHaveProperty("chainJsonUrl", "https://github.com/chain");
            expect(provider).toHaveProperty("logger", logger);
            expect(provider).toHaveProperty("cache", cache);
        });

        it("throw an error when creating a GithubMetadataProvider and dependencies are missing", () => {
            const metadata: MetadataConfig<MetadataSource> = {
                source: "github",
                tokenUrl: "https://github.com/token",
                chainUrl: "https://github.com/chain",
            };

            expect(() => {
                MetadataProviderFactory.create(metadata);
            }).toThrow("Missing dependencies");
        });

        it("create a LocalFileMetadataProvider when metadata source is 'local' and dependencies are provided", () => {
            const metadata: MetadataConfig<MetadataSource> = {
                source: "local",
                tokenJsonPath: "/path/to/token.json",
                chainJsonPath: "/path/to/chain.json",
            };
            const deps = {
                logger,
            };

            vi.spyOn(fs, "existsSync").mockReturnValue(true);
            vi.spyOn(fs, "readFileSync")
                .mockReturnValueOnce(JSON.stringify(mockTokenData))
                .mockReturnValueOnce(JSON.stringify(mockChainData));

            const provider = MetadataProviderFactory.create(metadata, deps);

            expect(provider).toBeInstanceOf(LocalFileMetadataProvider);
            expect(provider).toHaveProperty("tokenJsonPath", "/path/to/token.json");
            expect(provider).toHaveProperty("chainJsonPath", "/path/to/chain.json");
            expect(provider).toHaveProperty("logger", logger);
        });

        it("throw an error when creating a LocalFileMetadataProvider and dependencies are missing", () => {
            const metadata: MetadataConfig<MetadataSource> = {
                source: "local",
                tokenJsonPath: "/path/to/token.json",
                chainJsonPath: "/path/to/chain.json",
            };

            expect(() => {
                MetadataProviderFactory.create(metadata);
            }).toThrow("Missing dependencies");
        });

        it("create a StaticMetadataProvider when metadata source is 'static'", () => {
            const metadata: MetadataConfig<MetadataSource> = {
                source: "static",
            };

            const provider = MetadataProviderFactory.create(metadata);

            expect(provider).toBeInstanceOf(StaticMetadataProvider);
        });

        it("throw an error when metadata source is invalid", () => {
            const metadata: MetadataConfig<MetadataSource> = {
                source: "invalid" as any,
            };

            expect(() => {
                MetadataProviderFactory.create(metadata);
            }).toThrow("Invalid metadata source");
        });
    });
});
