import { ZKChainMetadata } from "../types";
import { nativeToken } from "./index";

export const zkChainsMetadata: ZKChainMetadata = new Map([
    [
        324n,
        {
            chainId: 324n,
            name: "ZKsyncERA",
            iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
            publicRpcs: [
                "https://mainnet.era.zksync.io",
                "https://zksync.drpc.org",
                "https://zksync.meowrpc.com",
            ],
            explorerUrl: "https://explorer.zksync.io/",
            launchDate: 1679626800,
            chainType: "Rollup",
            baseToken: nativeToken,
        },
    ],
    [
        388n,
        {
            chainId: 388n,
            name: "Cronos",
            iconUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
            chainType: "Rollup",
            publicRpcs: ["https://mainnet.zkevm.cronos.org"],
            explorerUrl: "https://explorer.zkevm.cronos.org/",
            baseToken: {
                symbol: "zkCRO",
                name: "zkCRO",
                contractAddress: "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2",
                coingeckoId: "unknown",
                type: "erc20",
                imageUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
                decimals: 18,
            },
            launchDate: 1679626800,
        },
    ],
]);
