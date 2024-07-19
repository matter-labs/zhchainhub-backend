import { Injectable } from "@nestjs/common";
import { InvalidArgumentException } from "@packages/providers/exceptions";
import {
    Abi,
    Address,
    Chain,
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionReturnType,
    createPublicClient,
    Hex,
    http,
    HttpTransport,
    toHex,
} from "viem";

/**
 * Acts as a wrapper around Viem library to provide methods to interact with an EVM-based blockchain.
 */
@Injectable()
export class EvmProviderService {
    private client: ReturnType<typeof createPublicClient<HttpTransport, Chain>>;

    constructor(
        rpcUrl: string,
        readonly chain: Chain,
    ) {
        this.client = createPublicClient({
            chain,
            transport: http(rpcUrl),
        });
    }

    /**
     * Retrieves the balance of the specified address.
     * @param {Address} address The address for which to retrieve the balance.
     * @returns {Promise<bigint>} A Promise that resolves to the balance of the address.
     */
    async getBalance(address: Address): Promise<bigint> {
        return this.client.getBalance({ address });
    }

    /**
     * Retrieves the current block number.
     * @returns {Promise<bigint>} A Promise that resolves to the latest block number.
     */
    async getBlockNumber(): Promise<bigint> {
        return this.client.getBlockNumber();
    }

    /**
     * Retrieves the current estimated gas price on the chain.
     * @returns {Promise<bigint>} A Promise that resolves to the current gas price.
     */
    async getGasPrice(): Promise<bigint> {
        return this.client.getGasPrice();
    }

    /**
     * Retrieves the value from a storage slot at a given address.
     * @param {Address} address The address of the contract.
     * @param {number} slot The slot number to read.
     * @returns {Promise<Hex>} A Promise that resolves to the value of the storage slot.
     * @throws {InvalidArgumentException} If the slot is not a positive integer.
     */
    async getStorageAt(address: Address, slot: number): Promise<Hex | undefined> {
        if (slot <= 0 || !Number.isInteger(slot)) {
            throw new InvalidArgumentException(
                `Slot must be a positive integer number. Received: ${slot}`,
            );
        }

        return this.client.getStorageAt({
            address,
            slot: toHex(slot),
        });
    }

    /**
     * Reads a contract "pure" or "view" function with the specified arguments using readContract from Viem.
     * @param {Address} contractAddress - The address of the contract.
     * @param {TAbi} abi - The ABI (Application Binary Interface) of the contract.
     * @param {TFunctionName} functionName - The name of the function to call.
     * @param {TArgs} [args] - The arguments to pass to the function (optional).
     * @returns A promise that resolves to the return value of the contract function.
     */
    async readContract<
        TAbi extends Abi,
        TFunctionName extends ContractFunctionName<TAbi, "pure" | "view"> = ContractFunctionName<
            TAbi,
            "pure" | "view"
        >,
        TArgs extends ContractFunctionArgs<
            TAbi,
            "pure" | "view",
            TFunctionName
        > = ContractFunctionArgs<TAbi, "pure" | "view", TFunctionName>,
    >(
        contractAddress: Address,
        abi: TAbi,
        functionName: TFunctionName,
        args?: TArgs,
    ): Promise<ContractFunctionReturnType<TAbi, "pure" | "view", TFunctionName, TArgs>> {
        return this.client.readContract({
            address: contractAddress,
            abi,
            functionName,
            args,
        });
    }
}
