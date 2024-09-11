import { ChainId, ChainType, Token } from "./index.js";

export type ZKChainMetadataItem = {
    chainId: ChainId;
    name: string;
    iconUrl?: string;
    chainType: ChainType;
    baseToken: Token<"erc20" | "native">;
    publicRpcs: string[];
    explorerUrl?: string;
    websiteUrl?: string;
    launchDate: number;
};

export type ZKChainMetadata = Map<ChainId, ZKChainMetadataItem>;
