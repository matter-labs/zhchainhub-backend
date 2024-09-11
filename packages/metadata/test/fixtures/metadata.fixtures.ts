import { Token, TokenType } from "@zkchainhub/shared";

export const tokenJsonUrl = "https://example.com/tokens.json";
export const chainJsonUrl = "https://example.com/chains.json";
export const mockTokenData: Token<TokenType>[] = [
    {
        name: "Ethereum",
        symbol: "ETH",
        contractAddress: null,
        type: "native",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
        decimals: 18,
    },
    {
        name: "Wrapped Ether",
        symbol: "WETH",
        contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        imageUrl: "https://coin-images.coingecko.com/coins/images/2518/large/weth.png?1696503332",
        type: "erc20",
        decimals: 18,
    },
] as const;
export const mockChainData = [
    {
        chainId: 324,
        name: "ZKsyncERA",
        iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
        publicRpcs: [
            "https://mainnet.era.zksync.io",
            "https://zksync.drpc.org",
            "https://zksync.meowrpc.com",
        ],
        explorerUrl: "https://explorer.zksync.io/",
        websiteUrl: "https://zksync.io/",
        launchDate: 1679626800,
        chainType: "Rollup",
        baseToken: {
            name: "Ethereum",
            symbol: "ETH",
            contractAddress: null,
            type: "native",
            imageUrl:
                "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
            decimals: 18,
        },
    },
    {
        chainId: 388,
        name: "Cronos",
        chainType: "Validium",
        publicRpcs: ["https://mainnet.zkevm.cronos.org"],
        explorerUrl: "https://explorer.zkevm.cronos.org/",
        baseToken: {
            symbol: "zkCRO",
            name: "zkCRO",
            contractAddress: "0x28Ff2E4dD1B58efEB0fC138602A28D5aE81e44e2",
            type: "erc20",
            imageUrl: "https://zkevm.cronos.org/images/chains/zkevm.svg",
            decimals: 18,
        },
        launchDate: 1679626800,
    },
];
