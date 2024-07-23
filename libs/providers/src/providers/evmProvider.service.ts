import { Injectable } from "@nestjs/common";
import { DataDecodeException, InvalidArgumentException } from "@packages/providers/exceptions";
import { AbiWithConstructor } from "@packages/providers/types";
import { AbiParameter } from "abitype";
import {
    Abi,
    Address,
    Chain,
    ContractConstructorArgs,
    ContractFunctionArgs,
    ContractFunctionName,
    ContractFunctionReturnType,
    createPublicClient,
    decodeAbiParameters,
    DecodeAbiParametersReturnType,
    encodeDeployData,
    GetBlockReturnType,
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
     * Retrieves the current block number.
     * @returns {Promise<GetBlockReturnType>} Latest block number.
     */
    async getBlockByNumber(blockNumber: number): Promise<GetBlockReturnType> {
        return this.client.getBlock({ blockNumber: BigInt(blockNumber) });
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

    /**
     * Executes a batch request to deploy a contract and returns the decoded constructor return parameters.
     * @param {AbiWithConstructor} abi - The ABI (Application Binary Interface) of the contract. Must contain a constructor.
     * @param {Hex} bytecode - The bytecode of the contract.
     * @param {ContractConstructorArgs<typeof abi>} args - The constructor arguments for the contract.
     * @param constructorReturnParams - The return parameters of the contract's constructor.
     * @returns The decoded constructor return parameters.
     * @throws {DataDecodeException} if there is no return data or if the return data does not match the expected type.
     */
    async batchRequest<ReturnType extends readonly AbiParameter[]>(
        abi: AbiWithConstructor,
        bytecode: Hex,
        args: ContractConstructorArgs<typeof abi>,
        constructorReturnParams: ReturnType,
    ): Promise<DecodeAbiParametersReturnType<ReturnType>> {
        const deploymentData = args ? encodeDeployData({ abi, bytecode, args }) : bytecode;

        const { data: returnData } = await this.client.call({
            data: deploymentData,
        });

        if (!returnData) {
            throw new DataDecodeException("No return data");
        }

        try {
            const decoded = decodeAbiParameters(constructorReturnParams, returnData);
            return decoded;
        } catch (e) {
            throw new DataDecodeException("Error decoding return data with given AbiParameters");
        }
    }
}
