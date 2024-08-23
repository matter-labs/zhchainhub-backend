import assert from "assert";
import { isNativeError } from "util/types";
import {
    Address,
    encodeFunctionData,
    erc20Abi,
    formatUnits,
    Hex,
    parseEther,
    parseUnits,
    zeroAddress,
} from "viem";

import { EvmProvider } from "@zkchainhub/chain-providers";
import { IPricingProvider } from "@zkchainhub/pricing";
import {
    BatchesInfo,
    ChainId,
    Chains,
    ChainType,
    erc20Tokens,
    ETH_TOKEN_ADDRESS,
    ILogger,
    isNativeToken,
    nativeToken,
    Token,
    tokens,
    WETH,
} from "@zkchainhub/shared";

import {
    AssetTvl,
    bridgeHubAbi,
    diamondProxyAbi,
    FeeParams,
    feeParamsFieldHexDigits,
    GasInfo,
    InvalidChainId,
    InvalidChainType,
    L1MetricsServiceException,
    multicall3Abi,
    sharedBridgeAbi,
    stateTransitionManagerAbi,
} from "../internal.js";

const ONE_ETHER = parseEther("1");
const FEE_PARAMS_SLOT: Hex = `0x26`;

/**
 * Acts as a wrapper around Viem library to provide methods to interact with an EVM-based blockchain.
 */
export class L1MetricsService {
    private readonly diamondContracts: Map<ChainId, Address> = new Map();
    private chainIds?: ChainId[];
    constructor(
        private readonly bridgeHubAddress: Address,
        private readonly sharedBridgeAddress: Address,
        private readonly stateTransitionManagerAddresses: Address[],
        private readonly evmProviderService: EvmProvider,
        private readonly pricingService: IPricingProvider,
        private readonly logger: ILogger,
    ) {}

    /**
     * Retrieves the Total Value Locked by token on L1 Shared Bridge contract
     * @returns A Promise that resolves to an array of AssetTvl objects representing the TVL for each asset.
     */
    async l1Tvl(): Promise<AssetTvl[]> {
        const erc20Addresses = Object.values(erc20Tokens).map((token) => token.contractAddress);

        const balances = await this.fetchTokenBalances(erc20Addresses);
        const pricesRecord = await this.pricingService.getTokenPrices(
            tokens.map((token) => token.coingeckoId),
        );

        assert(Object.keys(pricesRecord).length === tokens.length, "Invalid prices length");

        return this.calculateTvl(balances, erc20Addresses, pricesRecord);
    }

    /**
     * Calculates the Total Value Locked (TVL) for each token based on the provided balances, addresses, and prices.
     * @param balances - The balances object containing the ETH balance and an array of erc20 token addresses balance.
     * @param addresses - The array of erc20 addresses.
     * @param prices - The object containing the prices of tokens.
     * @returns An array of AssetTvl objects representing the TVL for each token in descending order.
     */
    private calculateTvl(
        balances: { ethBalance: bigint; addressesBalance: bigint[] },
        addresses: Address[],
        prices: Record<string, number>,
    ): AssetTvl[] {
        const tvl: AssetTvl[] = [];

        for (const token of tokens) {
            const { coingeckoId, ...tokenInfo } = token;

            const balance = isNativeToken(token)
                ? balances.ethBalance
                : balances.addressesBalance[
                      addresses.indexOf(tokenInfo.contractAddress as Address)
                  ];

            assert(balance !== undefined, `Balance for ${tokenInfo.symbol} not found`);

            const price = prices[coingeckoId] as number;
            // math is done with bigints for better precision
            const tvlValue = formatUnits(
                balance * parseUnits(price.toString(), tokenInfo.decimals),
                tokenInfo.decimals * 2,
            );

            const assetTvl: AssetTvl = {
                amount: formatUnits(balance, tokenInfo.decimals),
                amountUsd: tvlValue,
                price: price.toString(),
                ...tokenInfo,
            };

            tvl.push(assetTvl);
        }

        // we assume the rounding error is negligible for sorting purposes
        tvl.sort((a, b) => Number(b.amountUsd) - Number(a.amountUsd));

        return tvl;
    }

    /**
     * Fetches the token balances for the given addresses and ETH balance.
     * @param addresses - An array of addresses for which to fetch the token balances.
     * @returns A promise that resolves to an object containing the ETH balance and an array of address balances.
     */
    private async fetchTokenBalances(
        addresses: Address[],
    ): Promise<{ ethBalance: bigint; addressesBalance: bigint[] }> {
        const multicall3Address = this.evmProviderService.getMulticall3Address();
        let balances: bigint[] = [];

        if (multicall3Address) {
            balances = await this.evmProviderService.multicall({
                contracts: [
                    ...addresses.map((tokenAddress) => {
                        return {
                            address: tokenAddress,
                            abi: erc20Abi,
                            functionName: "balanceOf",
                            args: [this.sharedBridgeAddress],
                        } as const;
                    }),
                    {
                        address: multicall3Address,
                        abi: multicall3Abi,
                        functionName: "getEthBalance",
                        args: [this.sharedBridgeAddress],
                    } as const,
                ],
                allowFailure: false,
            } as const);
        } else {
            balances = await Promise.all([
                ...addresses.map((tokenAddress) =>
                    this.evmProviderService.readContract(tokenAddress, erc20Abi, "balanceOf", [
                        this.sharedBridgeAddress,
                    ]),
                ),
                this.evmProviderService.getBalance(this.sharedBridgeAddress),
            ]);
        }

        assert(balances.length === addresses.length + 1, "Invalid balances length");

        return {
            ethBalance: balances[addresses.length]!,
            addressesBalance: balances,
        };
    }

    /**
     *  Retrieves the information about the batches from L2 chain
     * @param chainId - The chain id for which to get the batches info
     * @returns commits, verified and executed batches
     */
    async getBatchesInfo(chainId: bigint): Promise<BatchesInfo> {
        const diamondProxyAddress = await this.fetchDiamondProxyAddress(chainId);
        const [commited, verified, executed] = await this.evmProviderService.multicall({
            contracts: [
                {
                    address: diamondProxyAddress,
                    abi: diamondProxyAbi,
                    functionName: "getTotalBatchesCommitted",
                    args: [],
                } as const,
                {
                    address: diamondProxyAddress,
                    abi: diamondProxyAbi,
                    functionName: "getTotalBatchesVerified",
                    args: [],
                } as const,
                {
                    address: diamondProxyAddress,
                    abi: diamondProxyAbi,
                    functionName: "getTotalBatchesExecuted",
                    args: [],
                } as const,
            ],
            allowFailure: false,
        });
        return { commited, verified, executed };
    }

    /**
     * Retrieves the Total Value Locked for {chainId} by L1 token
     * @returns A Promise that resolves to an array of AssetTvl objects representing the TVL for each asset.
     */
    async tvl(chainId: ChainId): Promise<AssetTvl[]> {
        const erc20Addresses = Object.values(erc20Tokens).map((token) => token.contractAddress);

        const balances = await this.fetchTokenBalancesByChain(chainId, erc20Addresses);
        const pricesRecord = await this.pricingService.getTokenPrices(
            tokens.map((token) => token.coingeckoId),
        );

        assert(Object.keys(pricesRecord).length === tokens.length, "Invalid prices length");

        return this.calculateTvl(balances, erc20Addresses, pricesRecord);
    }

    /**
     * Fetches the token balances for the given addresses and ETH balance on {chainId}
     * Note: The last balance in the returned array is the ETH balance, so the fetch length should be addresses.length + 1.
     * @param addresses - An array of addresses for which to fetch the token balances.
     * @returns A promise that resolves to an object containing the ETH balance and an array of address balances.
     */
    private async fetchTokenBalancesByChain(chainId: ChainId, addresses: Address[]) {
        const balances = await this.evmProviderService.multicall({
            contracts: [
                ...addresses.map((tokenAddress) => {
                    return {
                        address: this.sharedBridgeAddress,
                        abi: sharedBridgeAbi,
                        functionName: "chainBalance",
                        args: [chainId, tokenAddress],
                    } as const;
                }),
                {
                    address: this.sharedBridgeAddress,
                    abi: sharedBridgeAbi,
                    functionName: "chainBalance",
                    args: [chainId, ETH_TOKEN_ADDRESS],
                } as const,
            ],
            allowFailure: false,
        });

        return { ethBalance: balances[addresses.length]!, addressesBalance: balances.slice(0, -1) };
    }

    async chainType(chainId: ChainId): Promise<ChainType> {
        const diamondProxyAddress = await this.fetchDiamondProxyAddress(chainId);
        const chainTypeIndex = await this.evmProviderService.readContract(
            diamondProxyAddress,
            diamondProxyAbi,
            "getPubdataPricingMode",
            [],
        );
        const chainType = Chains[chainTypeIndex];
        if (!chainType) {
            throw new InvalidChainType(chainTypeIndex);
        }
        return chainType;
    }

    /**
     * Fetches the diamond proxy address for the given chain id and caches it for future use.
     * @param chainId - The chain id for which to fetch the diamond proxy address.
     * @returns Diamond proxy address.
     */
    private async fetchDiamondProxyAddress(chainId: ChainId): Promise<Address> {
        let diamondProxyAddress: Address | undefined = this.diamondContracts.get(chainId);

        if (!diamondProxyAddress) {
            diamondProxyAddress = await this.evmProviderService.readContract(
                this.bridgeHubAddress,
                bridgeHubAbi,
                "getHyperchain",
                [chainId],
            );
            if (diamondProxyAddress == zeroAddress) {
                throw new InvalidChainId(`Chain ID ${chainId} doesn't exist on the ecosystem`);
            }
            this.diamondContracts.set(chainId, diamondProxyAddress);
        }
        return diamondProxyAddress;
    }

    /**
     * Retrieves gas information for Ethereum transfers and ERC20 token transfers.
     * @returns {GasInfo} A promise that resolves to an object containing gas-related information.
     */
    async ethGasInfo(): Promise<GasInfo> {
        try {
            const [ethTransferGasCost, erc20TransferGasCost, gasPrice] = await Promise.all([
                // Estimate gas for an ETH transfer.
                this.evmProviderService.estimateGas({
                    account: zeroAddress,
                    to: zeroAddress,
                    value: ONE_ETHER,
                }),
                // Estimate gas for an ERC20 transfer.
                this.evmProviderService.estimateGas({
                    account: zeroAddress,
                    to: WETH.contractAddress,
                    data: encodeFunctionData({
                        abi: erc20Abi,
                        functionName: "transfer",
                        args: [this.sharedBridgeAddress, ONE_ETHER],
                    }),
                }),
                // Get the current gas price.
                this.evmProviderService.getGasPrice(),
            ]);
            // Get the current price of ether.
            let ethPriceInUsd: number | undefined = undefined;
            try {
                const priceResult = await this.pricingService.getTokenPrices([
                    nativeToken.coingeckoId,
                ]);
                ethPriceInUsd = priceResult[nativeToken.coingeckoId];
            } catch (e) {
                this.logger.error("Failed to get the price of ether.");
            }

            return {
                gasPrice,
                ethPrice: ethPriceInUsd,
                ethTransfer: ethTransferGasCost,
                erc20Transfer: erc20TransferGasCost,
            };
        } catch (e: unknown) {
            if (isNativeError(e)) {
                this.logger.error(`Failed to get gas information: ${e.message}`);
            }
            throw new L1MetricsServiceException(`Failed to get gas information from L1. ${e}`);
        }
    }

    /**
     * Get the chainIds for the ecosystem
     * @returns A list of chainIds
     */
    async getChainIds(): Promise<ChainId[]> {
        //FIXME: this should have a ttl. Will be fixed once we add caching here.
        if (!this.chainIds) {
            const chainIds = await this.evmProviderService.multicall({
                contracts: this.stateTransitionManagerAddresses.map((address) => {
                    return {
                        address,
                        abi: stateTransitionManagerAbi,
                        functionName: "getAllHyperchainChainIDs",
                        args: [],
                    } as const;
                }),
                allowFailure: false,
            });
            this.chainIds = chainIds.flat();
        }
        return this.chainIds;
    }
    /**
     * Get the base token for each chain
     * @returns A map of chainId to base token address
     */
    async getBaseTokens(chainIds: ChainId[]): Promise<Token<"erc20" | "native">[]> {
        if (chainIds.length === 0) return [];
        const baseTokens = await this.evmProviderService.multicall({
            contracts: chainIds.map((chainId) => {
                return {
                    address: this.bridgeHubAddress,
                    abi: bridgeHubAbi,
                    functionName: "baseToken",
                    args: [chainId],
                } as const;
            }),
            allowFailure: false,
        });
        return baseTokens.map((baseToken) => {
            return baseToken === ETH_TOKEN_ADDRESS
                ? nativeToken
                : erc20Tokens[baseToken] || {
                      contractAddress: baseToken,
                      decimals: 18,
                      name: "unknown",
                      type: "erc20",
                      symbol: "unknown",
                      coingeckoId: "unknown",
                  };
        });
    }

    /**
     * Retrieves the fee parameters for a specific chain.
     *
     * @param chainId - The ID of the chain.
     * @returns A Promise that resolves to a FeeParams object containing the fee parameters.
     * @throws {L1MetricsServiceException} If the fee parameters cannot be retrieved from L1.
     */
    async feeParams(chainId: ChainId): Promise<FeeParams> {
        const diamondProxyAddress = await this.fetchDiamondProxyAddress(chainId);

        // Read the storage at the target slot;
        const feeParamsData = await this.evmProviderService.getStorageAt(
            diamondProxyAddress,
            FEE_PARAMS_SLOT,
        );
        if (!feeParamsData) {
            throw new L1MetricsServiceException("Failed to get fee params from L1.");
        }

        const strippedParamsData = feeParamsData.replace(/^0x/, "");
        let cursor = strippedParamsData.length;
        const values: string[] = [];

        //read fields from Right to Left
        for (const digits of feeParamsFieldHexDigits) {
            const hexValue = strippedParamsData.slice(cursor - digits, cursor);
            assert(hexValue, "Error parsing fee params");
            values.push(hexValue);
            cursor -= digits;
        }

        const [
            pubdataPricingMode,
            batchOverheadL1Gas,
            maxPubdataPerBatch,
            maxL2GasPerBatch,
            priorityTxMaxPubdata,
            minimalL2GasPrice,
        ] = values as [string, string, string, string, string, string];

        // Convert hex to decimal
        return {
            pubdataPricingMode: parseInt(pubdataPricingMode, 16),
            batchOverheadL1Gas: parseInt(batchOverheadL1Gas, 16),
            maxPubdataPerBatch: parseInt(maxPubdataPerBatch, 16),
            maxL2GasPerBatch: parseInt(maxL2GasPerBatch, 16),
            priorityTxMaxPubdata: parseInt(priorityTxMaxPubdata, 16),
            minimalL2GasPrice: BigInt(`0x${minimalL2GasPrice}`),
        };
    }
}
