import { createMock } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { parseAbi } from "abitype";
import * as viem from "viem";
import { localhost } from "viem/chains";

import { EvmProviderService } from "./evmProvider.service";

const mockClient = createMock<ReturnType<typeof viem.createPublicClient>>();

jest.mock("viem", () => ({
    ...jest.requireActual("viem"),
    createPublicClient: jest.fn().mockImplementation(() => mockClient),
    http: jest.fn(),
}));

describe("EvmProviderService", () => {
    let viemProvider: EvmProviderService;
    const testAbi = parseAbi([
        "function balanceOf(address owner) view returns (uint256)",
        "function tokenURI(uint256 tokenId) pure returns (string)",
    ]);

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: EvmProviderService,
                    useFactory: () => {
                        const rpcUrl = "http://localhost:8545";
                        const chain = localhost;
                        return new EvmProviderService(rpcUrl, chain);
                    },
                },
            ],
        }).compile();

        viemProvider = app.get<EvmProviderService>(EvmProviderService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getBalance", () => {
        it("should return the balance of the specified address", async () => {
            const address = "0x123456789";
            const expectedBalance = 100n;
            jest.spyOn(mockClient, "getBalance").mockResolvedValue(expectedBalance);

            const balance = await viemProvider.getBalance(address);

            expect(balance).toBe(expectedBalance);
            expect(mockClient.getBalance).toHaveBeenCalledWith({ address });
        });
    });

    describe("getBlockNumber", () => {
        it("should return the current block number", async () => {
            const expectedBlockNumber = 1000n;
            jest.spyOn(mockClient, "getBlockNumber").mockResolvedValue(expectedBlockNumber);

            const blockNumber = await viemProvider.getBlockNumber();

            expect(blockNumber).toBe(expectedBlockNumber);
        });
    });

    describe("getGasPrice", () => {
        it("should return the current gas price", async () => {
            const expectedGasPrice = BigInt(100);

            // Mock the getGasPrice method of the Viem client
            jest.spyOn(viemProvider["client"], "getGasPrice").mockResolvedValue(expectedGasPrice);

            const gasPrice = await viemProvider.getGasPrice();

            expect(gasPrice).toBe(expectedGasPrice);
        });
    });

    describe("getStorageAt", () => {
        it("should return the value of the storage slot at the given address and slot number", async () => {
            const address = "0x123456789";
            const slot = 1;
            const expectedValue = "0xabcdef";
            jest.spyOn(mockClient, "getStorageAt").mockResolvedValue(expectedValue);

            const value = await viemProvider.getStorageAt(address, slot);

            expect(value).toBe(expectedValue);
            expect(mockClient.getStorageAt).toHaveBeenCalledWith({ address, slot: "0x1" });
        });

        it("should throw an error if the slot is not a positive integer", async () => {
            const address = "0x123456789";
            const slot = -1;

            await expect(viemProvider.getStorageAt(address, slot)).rejects.toThrowError(
                "Slot must be a positive integer number. Received: -1",
            );
        });
    });

    describe("readContract", () => {
        it("should call the readContract method of the Viem client with the correct arguments", async () => {
            const contractAddress = "0x123456789";
            const abi = testAbi;
            const functionName = "balanceOf";
            const expectedReturnValue = 5n;

            // Mock the readContract method of the Viem client
            jest.spyOn(mockClient, "readContract").mockResolvedValue(expectedReturnValue);

            const returnValue = await viemProvider.readContract(contractAddress, abi, functionName);

            expect(returnValue).toBe(expectedReturnValue);
            expect(mockClient.readContract).toHaveBeenCalledWith({
                address: contractAddress,
                abi,
                functionName,
            });
        });

        it("should call the readContract method of the Viem client with the correct arguments when args are provided", async () => {
            const contractAddress = "0x123456789";
            const functionName = "tokenURI";
            const args = [1n] as const;
            const expectedReturnValue = "tokenUri";

            // Mock the readContract method of the Viem client
            jest.spyOn(mockClient, "readContract").mockResolvedValue(expectedReturnValue);

            const returnValue = await viemProvider.readContract(
                contractAddress,
                testAbi,
                functionName,
                args,
            );

            expect(returnValue).toBe(expectedReturnValue);
            expect(mockClient.readContract).toHaveBeenCalledWith({
                address: contractAddress,
                abi: testAbi,
                functionName,
                args,
            });
        });
    });
});
