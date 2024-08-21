/**
 * The token list in this file was manually crafted and represents the top 50
 * tokens by market cap, held by L1 Shared Bridge contract and with data
 * present in Coingecko.
 * Last updated: 2024-08-03
 *
 * This list is not exhaustive and can be updated with more tokens as needed.
 * Link to the token list: https://etherscan.io/tokenholdings?a=0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB
 */

import { Address } from "abitype";

import { Token, TokenType } from "../internal.js";

export const nativeToken: Readonly<Token<"native">> = {
    name: "Ethereum",
    symbol: "ETH",
    contractAddress: null,
    coingeckoId: "ethereum",
    type: "native",
    imageUrl: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    decimals: 18,
};

export const WETH: Readonly<Token<"erc20">> = {
    name: "Wrapped Ether",
    symbol: "WETH",
    contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    coingeckoId: "weth",
    imageUrl: "https://coin-images.coingecko.com/coins/images/2518/large/weth.png?1696503332",
    type: "erc20",
    decimals: 18,
};

export const erc20Tokens: Readonly<Record<Address, Token<"erc20">>> = {
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
        name: "USDC",
        symbol: "USDC",
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        coingeckoId: "usd-coin",
        imageUrl: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694",
        type: "erc20",
        decimals: 6,
    },
    "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE": {
        name: "Koi",
        symbol: "KOI",
        contractAddress: "0x9D14BcE1dADdf408d77295BB1be9b343814f44DE",
        coingeckoId: "koi-3",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/35766/large/Koi_logo.png?1709782399",
        type: "erc20",
        decimals: 18,
    },
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": {
        name: "Tether USD",
        symbol: "USDT",
        contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        coingeckoId: "tether",
        imageUrl: "https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661",
        type: "erc20",
        decimals: 6,
    },
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": {
        name: "Wrapped BTC",
        symbol: "WBTC",
        contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        coingeckoId: "wrapped-bitcoin",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png?1696507857",
        type: "erc20",
        decimals: 8,
    },
    "0x77F76483399Dc6328456105B1db23e2Aca455bf9": {
        name: "HYCO",
        symbol: "HYCO",
        contractAddress: "0x77F76483399Dc6328456105B1db23e2Aca455bf9",
        coingeckoId: "hypercomic",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/29407/large/coingecko_HYPERCOMIC_LOGO.png?1696528357",
        type: "erc20",
        decimals: 18,
    },
    "0xae78736Cd615f374D3085123A210448E74Fc6393": {
        name: "Rocket Pool ETH",
        symbol: "rETH",
        contractAddress: "0xae78736Cd615f374D3085123A210448E74Fc6393",
        coingeckoId: "rocket-pool-eth",
        imageUrl: "https://coin-images.coingecko.com/coins/images/20764/large/reth.png?1696520159",
        type: "erc20",
        decimals: 18,
    },
    "0xF9c53268e9de692AE1b2ea5216E24e1c3ad7CB1E": {
        name: "Idexo Token",
        symbol: "IDO",
        contractAddress: "0xF9c53268e9de692AE1b2ea5216E24e1c3ad7CB1E",
        coingeckoId: "idexo-token",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/18523/large/qOiqm7T8_400x400.jpg?1696518004",
        type: "erc20",
        decimals: 18,
    },
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": {
        name: "Dai Stablecoin",
        symbol: "DAI",
        contractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        coingeckoId: "dai",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png?1696509996",
        type: "erc20",
        decimals: 18,
    },
    "0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0": {
        name: "DEXTF Token",
        symbol: "DEXTF",
        contractAddress: "0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0",
        coingeckoId: "dextf",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/12634/large/0qgT0aMu_400x400.jpg?1696512442",
        type: "erc20",
        decimals: 18,
    },
    "0xeEAA40B28A2d1b0B08f6f97bB1DD4B75316c6107": {
        name: "GOVI",
        symbol: "GOVI",
        contractAddress: "0xeEAA40B28A2d1b0B08f6f97bB1DD4B75316c6107",
        coingeckoId: "govi",
        imageUrl: "https://coin-images.coingecko.com/coins/images/13875/large/GOVI.png?1696513619",
        type: "erc20",
        decimals: 18,
    },
    "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0": {
        name: "LUSD Stablecoin",
        symbol: "LUSD",
        contractAddress: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
        coingeckoId: "liquity-usd",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/14666/large/Group_3.png?1696514341",
        type: "erc20",
        decimals: 18,
    },
    "0x6982508145454Ce325dDbE47a25d4ec3d2311933": {
        name: "Pepe",
        symbol: "PEPE",
        contractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        coingeckoId: "pepe",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1696528776",
        type: "erc20",
        decimals: 18,
    },
    "0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9": {
        name: "Symbiosis",
        symbol: "SIS",
        contractAddress: "0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9",
        coingeckoId: "symbiosis-finance",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/20805/large/SymbiosisFinance_logo-150x150.jpeg?1696520198",
        type: "erc20",
        decimals: 18,
    },
    "0xDDdddd4301A082e62E84e43F474f044423921918": {
        name: "DeversiFi Token",
        symbol: "DVF",
        contractAddress: "0xDDdddd4301A082e62E84e43F474f044423921918",
        coingeckoId: "rhinofi",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/16414/large/rhinologo.png?1697736807",
        type: "erc20",
        decimals: 18,
    },
    "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704": {
        name: "Coinbase Wrapped Staked ETH",
        symbol: "cbETH",
        contractAddress: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
        coingeckoId: "coinbase-wrapped-staked-eth",
        imageUrl: "https://coin-images.coingecko.com/coins/images/27008/large/cbeth.png?1709186989",
        type: "erc20",
        decimals: 18,
    },
    "0xBBBbbBBB46A1dA0F0C3F64522c275BAA4C332636": {
        name: "ZKBase",
        symbol: "ZKB",
        contractAddress: "0xBBBbbBBB46A1dA0F0C3F64522c275BAA4C332636",
        coingeckoId: "zkspace",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/13585/large/image_2024-01-16_172847810.png?1705397359",
        type: "erc20",
        decimals: 18,
    },
    "0xD31a59c85aE9D8edEFeC411D448f90841571b89c": {
        name: "Wrapped SOL (Wormhole)",
        symbol: "SOL",
        contractAddress: "0xD31a59c85aE9D8edEFeC411D448f90841571b89c",
        coingeckoId: "sol-wormhole",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/22876/large/SOL_wh_small.png?1696522175",
        type: "erc20",
        decimals: 9,
    },
    "0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC": {
        name: "Storj",
        symbol: "STORJ",
        contractAddress: "0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC",
        coingeckoId: "storj",
        imageUrl: "https://coin-images.coingecko.com/coins/images/949/large/storj.png?1696502065",
        type: "erc20",
        decimals: 18,
    },
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
        name: "Wrapped Ether",
        symbol: "WETH",
        contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        coingeckoId: "weth",
        imageUrl: "https://coin-images.coingecko.com/coins/images/2518/large/weth.png?1696503332",
        type: "erc20",
        decimals: 18,
    },
    "0x582d872A1B094FC48F5DE31D3B73F2D9bE47def1": {
        name: "Wrapped TON Coin",
        symbol: "TONCOIN",
        contractAddress: "0x582d872A1B094FC48F5DE31D3B73F2D9bE47def1",
        coingeckoId: "the-open-network",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/17980/large/ton_symbol.png?1696517498",
        type: "erc20",
        decimals: 9,
    },
    "0xfAC77A24E52B463bA9857d6b758ba41aE20e31FF": {
        name: "LSD Coin",
        symbol: "LSD",
        contractAddress: "0xfAC77A24E52B463bA9857d6b758ba41aE20e31FF",
        coingeckoId: "lsdx-finance",
        imageUrl: "https://coin-images.coingecko.com/coins/images/29519/large/logo.png?1696528462",
        type: "erc20",
        decimals: 18,
    },
    "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E": {
        name: "Curve.Fi USD Stablecoin",
        symbol: "crvUSD",
        contractAddress: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
        coingeckoId: "crvusd",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/30118/large/0xf939e0a03fb07f59a73314e73794be0e57ac1b4e.png?1721097561",
        type: "erc20",
        decimals: 18,
    },
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": {
        name: "Wrapped liquid staked Ether 2.0",
        symbol: "wstETH",
        contractAddress: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
        coingeckoId: "wrapped-steth",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/18834/large/wstETH.png?1696518295",
        type: "erc20",
        decimals: 18,
    },
    "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE": {
        name: "SHIBA INU",
        symbol: "SHIB",
        contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
        coingeckoId: "shiba-inu",
        imageUrl: "https://coin-images.coingecko.com/coins/images/11939/large/shiba.png?1696511800",
        type: "erc20",
        decimals: 18,
    },
    "0xA91ac63D040dEB1b7A5E4d4134aD23eb0ba07e14": {
        name: "Bella",
        symbol: "BEL",
        contractAddress: "0xA91ac63D040dEB1b7A5E4d4134aD23eb0ba07e14",
        coingeckoId: "bella-protocol",
        imageUrl: "https://coin-images.coingecko.com/coins/images/12478/large/Bella.png?1696512296",
        type: "erc20",
        decimals: 18,
    },
    "0x111111111117dC0aa78b770fA6A738034120C302": {
        name: "1INCH Token",
        symbol: "1INCH",
        contractAddress: "0x111111111117dC0aa78b770fA6A738034120C302",
        coingeckoId: "1inch",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/13469/large/1inch-token.png?1696513230",
        type: "erc20",
        decimals: 18,
    },
    "0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9": {
        name: "Deri",
        symbol: "DERI",
        contractAddress: "0xA487bF43cF3b10dffc97A9A744cbB7036965d3b9",
        coingeckoId: "deri-protocol",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/13931/large/200vs200.jpg?1696513670",
        type: "erc20",
        decimals: 18,
    },
    "0x163f8C2467924be0ae7B5347228CABF260318753": {
        name: "Worldcoin",
        symbol: "WLD",
        contractAddress: "0x163f8C2467924be0ae7B5347228CABF260318753",
        coingeckoId: "worldcoin-wld",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/31069/large/worldcoin.jpeg?1696529903",
        type: "erc20",
        decimals: 18,
    },
    "0x7448c7456a97769F6cD04F1E83A4a23cCdC46aBD": {
        name: "Maverick Token",
        symbol: "MAV",
        contractAddress: "0x7448c7456a97769F6cD04F1E83A4a23cCdC46aBD",
        coingeckoId: "maverick-protocol",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/30850/large/MAV_Logo.png?1696529701",
        type: "erc20",
        decimals: 18,
    },
    "0xa41d2f8Ee4F47D3B860A149765A7dF8c3287b7F0": {
        name: "Syncus",
        symbol: "SYNC",
        contractAddress: "0xa41d2f8Ee4F47D3B860A149765A7dF8c3287b7F0",
        coingeckoId: "syncus",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/33573/large/Syncus.png?1702450708",
        type: "erc20",
        decimals: 18,
    },
    "0xC91a71A1fFA3d8B22ba615BA1B9c01b2BBBf55ad": {
        name: "ZigZag",
        symbol: "ZZ",
        contractAddress: "0xC91a71A1fFA3d8B22ba615BA1B9c01b2BBBf55ad",
        coingeckoId: "zigzag-2",
        imageUrl: "https://coin-images.coingecko.com/coins/images/26141/large/zig_zag.?1696525229",
        type: "erc20",
        decimals: 18,
    },
    "0x18084fbA666a33d37592fA2633fD49a74DD93a88": {
        name: "tBTC v2",
        symbol: "tBTC",
        contractAddress: "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
        coingeckoId: "tbtc",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/11224/large/0x18084fba666a33d37592fa2633fd49a74dd93a88.png?1696511155",
        type: "erc20",
        decimals: 18,
    },
    "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7": {
        name: "rsETH",
        symbol: "rsETH",
        contractAddress: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
        coingeckoId: "kelp-dao-restaked-eth",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/33800/large/Icon___Dark.png?1702991855",
        type: "erc20",
        decimals: 18,
    },
    "0x0a77eF9bf662D62Fbf9BA4cf861EaA83F9CC4FEC": {
        name: "XWG",
        symbol: "XWG",
        contractAddress: "0x0a77eF9bf662D62Fbf9BA4cf861EaA83F9CC4FEC",
        coingeckoId: "x-world-games",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/17847/large/200_200_%281%29_%281%29.png?1696790226",
        type: "erc20",
        decimals: 18,
    },
    "0x72e364F2ABdC788b7E918bc238B21f109Cd634D7": {
        name: "Metaverse Index",
        symbol: "MVI",
        contractAddress: "0x72e364F2ABdC788b7E918bc238B21f109Cd634D7",
        coingeckoId: "metaverse-index",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/14684/large/MVI_logo.png?1696514357",
        type: "erc20",
        decimals: 18,
    },
    "0x514910771AF9Ca656af840dff83E8264EcF986CA": {
        name: "ChainLink Token",
        symbol: "LINK",
        contractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        coingeckoId: "chainlink",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1696502009",
        type: "erc20",
        decimals: 18,
    },
    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": {
        name: "Aave Token",
        symbol: "AAVE",
        contractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
        coingeckoId: "aave",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/12645/large/aave-token-round.png?1720472354",
        type: "erc20",
        decimals: 18,
    },
    "0x5C1d9aA868a30795F92fAe903eDc9eFF269044bf": {
        name: "Changer",
        symbol: "CNG",
        contractAddress: "0x5C1d9aA868a30795F92fAe903eDc9eFF269044bf",
        coingeckoId: "changer",
        imageUrl: "https://coin-images.coingecko.com/coins/images/21786/large/cng.png?1696521140",
        type: "erc20",
        decimals: 18,
    },
    "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0": {
        name: "Tellor Tributes",
        symbol: "TRB",
        contractAddress: "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0",
        coingeckoId: "tellor",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/9644/large/Blk_icon_current.png?1696509713",
        type: "erc20",
        decimals: 18,
    },
    "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110": {
        name: "Renzo Restaked ETH",
        symbol: "Renzo Restaked ETH",
        contractAddress: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
        coingeckoId: "renzo-restaked-eth",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/34753/large/Ezeth_logo_circle.png?1713496404",
        type: "erc20",
        decimals: 18,
    },
    "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0": {
        name: "Matic Token",
        symbol: "MATIC",
        contractAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
        coingeckoId: "matic-network",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/4713/large/polygon.png?1698233745",
        type: "erc20",
        decimals: 18,
    },
    "0x4691937a7508860F876c9c0a2a617E7d9E945D4B": {
        name: "WOO",
        symbol: "WOO",
        contractAddress: "0x4691937a7508860F876c9c0a2a617E7d9E945D4B",
        coingeckoId: "woo-network",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/12921/large/WOO_Logos_2023_Profile_Pic_WOO.png?1696512709",
        type: "erc20",
        decimals: 18,
    },
    "0x62D0A8458eD7719FDAF978fe5929C6D342B0bFcE": {
        name: "Beam",
        symbol: "BEAM",
        contractAddress: "0x62D0A8458eD7719FDAF978fe5929C6D342B0bFcE",
        coingeckoId: "beam-2",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/32417/large/chain-logo.png?1698114384",
        type: "erc20",
        decimals: 18,
    },
    "0xC9fE6E1C76210bE83DC1B5b20ec7FD010B0b1D15": {
        name: "Fringe",
        symbol: "FRIN",
        contractAddress: "0xC9fE6E1C76210bE83DC1B5b20ec7FD010B0b1D15",
        coingeckoId: "fringe-finance",
        imageUrl: "https://coin-images.coingecko.com/coins/images/13222/large/frin.png?1696513001",
        type: "erc20",
        decimals: 18,
    },
    "0xfFffFffF2ba8F66D4e51811C5190992176930278": {
        name: "Furucombo",
        symbol: "COMBO",
        contractAddress: "0xfFffFffF2ba8F66D4e51811C5190992176930278",
        coingeckoId: "furucombo",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/13629/large/COMBO_token_ol.png?1696513377",
        type: "erc20",
        decimals: 18,
    },
    "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa": {
        name: "mETH",
        symbol: "mETH",
        contractAddress: "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa",
        coingeckoId: "mantle-staked-ether",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/33345/large/symbol_transparent_bg.png?1701697066",
        type: "erc20",
        decimals: 18,
    },
    "0xe2353069f71a27bBbe66eEabfF05dE109c7d5E19": {
        name: "Bonsai3",
        symbol: "SEED",
        contractAddress: "0xe2353069f71a27bBbe66eEabfF05dE109c7d5E19",
        coingeckoId: "bonsai3",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/33162/large/logo-bonsai3200x200.png?1700830408",
        type: "erc20",
        decimals: 18,
    },
    "0xD33526068D116cE69F19A9ee46F0bd304F21A51f": {
        name: "Rocket Pool",
        symbol: "RPL",
        contractAddress: "0xD33526068D116cE69F19A9ee46F0bd304F21A51f",
        coingeckoId: "rocket-pool",
        imageUrl:
            "https://coin-images.coingecko.com/coins/images/2090/large/rocket_pool_%28RPL%29.png?1696503058",
        type: "erc20",
        decimals: 18,
    },
};

export const tokens: Readonly<Token<TokenType>[]> = [nativeToken, ...Object.values(erc20Tokens)];
