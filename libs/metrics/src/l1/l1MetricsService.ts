import assert from "assert";
import { isNativeError } from "util/types";
import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import {
    Address,
    encodeFunctionData,
    erc20Abi,
    formatUnits,
    parseEther,
    parseUnits,
    zeroAddress,
} from "viem";

import { InvalidChainId, L1MetricsServiceException } from "@zkchainhub/metrics/exceptions";
import { bridgeHubAbi, diamondProxyAbi, sharedBridgeAbi } from "@zkchainhub/metrics/l1/abis";
import { AssetTvl, GasInfo } from "@zkchainhub/metrics/types";
import { IPricingService, PRICING_PROVIDER } from "@zkchainhub/pricing";
import { EvmProviderService } from "@zkchainhub/providers";
import { BatchesInfo, ChainId, L1_CONTRACTS, vitalikAddress } from "@zkchainhub/shared";
import { ETH_TOKEN_ADDRESS } from "@zkchainhub/shared/constants";
import {
    erc20Tokens,
    isNativeToken,
    nativeToken,
    tokens,
    WETH,
} from "@zkchainhub/shared/tokens/tokens";

const ONE_ETHER = parseEther("1");

/**
 * Acts as a wrapper around Viem library to provide methods to interact with an EVM-based blockchain.
 */
@Injectable()
export class L1MetricsService {
    private readonly bridgeHub = {
        abi: bridgeHubAbi,
        address: L1_CONTRACTS.BRIDGE_HUB,
    };
    private readonly sharedBridge = {
        abi: sharedBridgeAbi,
        address: L1_CONTRACTS.SHARED_BRIDGE,
    };
    private readonly diamondContracts: Map<ChainId, Address> = new Map();

    constructor(
        private readonly evmProviderService: EvmProviderService,
        @Inject(PRICING_PROVIDER) private readonly pricingService: IPricingService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    /**
     * Retrieves the Total Value Locked by token on L1 Shared Bridge contract
     * @returns A Promise that resolves to an array of AssetTvl objects representing the TVL for each asset.
     */
    async l1Tvl(): Promise<AssetTvl[]> {
        const erc20Addresses = erc20Tokens.map((token) => token.contractAddress);

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
        const balances = await this.evmProviderService.multicall({
            contracts: [
                ...addresses.map((tokenAddress) => {
                    return {
                        address: tokenAddress,
                        abi: erc20Abi,
                        functionName: "balanceOf",
                        args: [this.sharedBridge.address],
                    } as const;
                }),
            ],
            allowFailure: false,
        });
        const ethBalance = await this.evmProviderService.getBalance(this.sharedBridge.address);

        assert(balances.length === addresses.length, "Invalid balances length");

        return { ethBalance: ethBalance, addressesBalance: balances };
    }

    /**
     *  Retrieves the information about the batches from L2 chain
     * @param chainId - The chain id for which to get the batches info
     * @returns commits, verified and executed batches
     */
    async getBatchesInfo(chainId: ChainId): Promise<BatchesInfo> {
        let diamondProxyAddress: Address | undefined = this.diamondContracts.get(chainId);

        if (!diamondProxyAddress) {
            diamondProxyAddress = await this.evmProviderService.readContract(
                this.bridgeHub.address,
                this.bridgeHub.abi,
                "getHyperchain",
                [chainId],
            );
            if (diamondProxyAddress == zeroAddress) {
                throw new InvalidChainId(`Chain ID ${chainId} doesn't exist on the ecosystem`);
            }
            this.diamondContracts.set(chainId, diamondProxyAddress);
        }

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
        const erc20Addresses = erc20Tokens.map((token) => token.contractAddress);

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
                        address: this.sharedBridge.address,
                        abi: this.sharedBridge.abi,
                        functionName: "chainBalance",
                        args: [chainId, tokenAddress],
                    } as const;
                }),
                {
                    address: this.sharedBridge.address,
                    abi: this.sharedBridge.abi,
                    functionName: "chainBalance",
                    args: [chainId, ETH_TOKEN_ADDRESS],
                } as const,
            ],
            allowFailure: false,
        });

        return { ethBalance: balances[addresses.length]!, addressesBalance: balances.slice(0, -1) };
    }

    //TODO: Implement chainType.
    async chainType(_chainId: ChainId): Promise<"validium" | "rollup"> {
        return "rollup";
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
                    account: vitalikAddress,
                    to: zeroAddress,
                    value: ONE_ETHER,
                }),
                // Estimate gas for an ERC20 transfer.
                this.evmProviderService.estimateGas({
                    account: vitalikAddress,
                    to: WETH.contractAddress,
                    data: encodeFunctionData({
                        abi: erc20Abi,
                        functionName: "transfer",
                        args: [L1_CONTRACTS.SHARED_BRIDGE, ONE_ETHER],
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
                ethTransferGas: ethTransferGasCost,
                erc20TransferGas: erc20TransferGasCost,
            };
        } catch (e: unknown) {
            if (isNativeError(e)) {
                this.logger.error(`Failed to get gas information: ${e.message}`);
            }
            throw new L1MetricsServiceException("Failed to get gas information from L1.");
        }
    }

    //TODO: Implement feeParams.
    async feeParams(_chainId: ChainId): Promise<{
        batchOverheadL1Gas: number;
        maxPubdataPerBatch: number;
        maxL2GasPerBatch: number;
        priorityTxMaxPubdata: number;
        minimalL2GasPrice: number;
    }> {
        return {
            batchOverheadL1Gas: 50000,
            maxPubdataPerBatch: 120000,
            maxL2GasPerBatch: 10000000,
            priorityTxMaxPubdata: 15000,
            minimalL2GasPrice: 10000000,
        };
    }
}
