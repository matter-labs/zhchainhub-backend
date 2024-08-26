import * as fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ILogger } from "@zkchainhub/shared";

import { FileNotFound, InvalidSchema, LocalFileMetadataProvider } from "../../../src/internal";
import { mockChainData, mockTokenData } from "../../fixtures/metadata.fixtures.js";

// Mock the logger
const mockLogger: ILogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

// Mock the file system functions
vi.mock("fs", () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
}));

describe("LocalFileMetadataProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("throws FileNotFound error if token JSON file does not exist", () => {
            vi.spyOn(fs, "existsSync").mockReturnValueOnce(false);

            expect(
                () => new LocalFileMetadataProvider("token.json", "chain.json", mockLogger),
            ).toThrow(FileNotFound);
        });

        it("throws FileNotFound error if chain JSON file does not exist", () => {
            vi.spyOn(fs, "existsSync").mockReturnValueOnce(true).mockReturnValueOnce(false);

            expect(
                () => new LocalFileMetadataProvider("token.json", "chain.json", mockLogger),
            ).toThrow(FileNotFound);
        });

        it("throws error on token schema validation", async () => {
            const invalidTokenData = [
                {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
                    explorerUrl: "https://etherscan.io",
                },
                {
                    name: "Wrapped Ether",
                    decimals: 18.5,
                    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
                    explorerUrl: "https://etherscan.io",
                },
            ];

            vi.spyOn(fs, "existsSync").mockReturnValue(true);
            vi.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify(invalidTokenData));

            expect(
                () => new LocalFileMetadataProvider("token.json", "chain.json", mockLogger),
            ).toThrow(InvalidSchema);
        });

        it("throws error on chain schema validation", async () => {
            const invalidChainData = [
                {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
                    explorerUrl: "https://etherscan.io",
                },
                {
                    chainId: 3,

                    symbol: "BNB",
                    decimals: 18,
                    rpcUrl: "https://bsc-dataseed.binance.org",
                    explorerUrl: "https://bscscan.com",
                },
            ];

            vi.spyOn(fs, "existsSync").mockReturnValue(true);
            vi.spyOn(fs, "readFileSync")
                .mockReturnValueOnce(JSON.stringify(mockTokenData))
                .mockReturnValue(JSON.stringify(invalidChainData));

            expect(
                () => new LocalFileMetadataProvider("token.json", "chain.json", mockLogger),
            ).toThrow(InvalidSchema);
        });

        it("read, parse and saves to variables the file data", async () => {
            vi.spyOn(fs, "existsSync").mockReturnValue(true);
            vi.spyOn(fs, "readFileSync")
                .mockReturnValueOnce(JSON.stringify(mockTokenData))
                .mockReturnValueOnce(JSON.stringify(mockChainData));

            const provider = new LocalFileMetadataProvider("token.json", "chain.json", mockLogger);
            const chainMetadata = await provider.getChainsMetadata();
            const tokenMetadata = await provider.getTokensMetadata();

            expect(provider).toBeDefined();
            expect(tokenMetadata).toEqual(provider["tokenMetadata"]);
            expect(chainMetadata).toEqual(provider["chainMetadata"]);
            expect(fs.readFileSync).toHaveBeenCalledWith("chain.json", "utf-8");
            expect(fs.readFileSync).toHaveBeenCalledWith("token.json", "utf-8");
        });
    });
});
