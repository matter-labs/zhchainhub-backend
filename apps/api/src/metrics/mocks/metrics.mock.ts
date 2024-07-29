import { EcosystemInfo, L2ChainInfo, Metadata, ZKChainInfo } from "../dto/response";

export const getEcosystemInfo = () => {
    const mock = new EcosystemInfo({
        l1Tvl: { ETH: 1000000, USDC: 500000 },
        ethGasInfo: {
            gasPrice: 50,
            ethTransfer: 21000,
            erc20Transfer: 65000,
        },
        zkChains: [
            {
                chainId: 0,
                chainType: "Rollup",
                nativeToken: "ETH",
                tvl: 1000000,
                metadata: true,
                rpc: true,
            },
            {
                chainId: 1,
                chainType: "Validium",
                nativeToken: "ETH",
                tvl: 500000,
                metadata: true,
                rpc: false,
            },
            {
                chainId: 2,
                chainType: "Rollup",
                tvl: 300000,
                metadata: false,
                rpc: true,
            },
            {
                chainId: 3,
                chainType: "Rollup",
                tvl: 10000,
                metadata: false,
                rpc: false,
            },
        ],
    });
    return mock;
};

const mockMetadata: Metadata = {
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
    chainName: "ZKsyncERA",
    publicRpcs: [
        { url: "https://mainnet.era.zksync.io", status: true },
        { url: "https://1rpc.io/zksync2-era", status: true },
        { url: "https://zksync.drpc.org", status: false },
    ],
    explorerUrl: "https://explorer.zksync.io/",
    launchDate: 1679626800,
    environment: "mainnet",
    nativeToken: "ETH",
};

const mockL2Info: L2ChainInfo = {
    tps: 10000000,
    avgBlockTime: 12,
    lastBlock: 1000000,
    lastBlockVerified: 999999,
};

export const getZKChainInfo = (chainId: number): ZKChainInfo => {
    const mock = new ZKChainInfo({
        chainType: "Rollup",
        tvl: { ETH: 1000000, USDC: 500000 },
        batchesInfo: {
            commited: 100,
            verified: 90,
            proved: 80,
        },
        feeParams: {
            batchOverheadL1Gas: 50000,
            maxPubdataPerBatch: 120000,
            maxL2GasPerBatch: 10000000,
            priorityTxMaxPubdata: 15000,
            minimalL2GasPrice: 0.25,
        },
    });
    switch (chainId) {
        case 0:
            mock.metadata = mockMetadata;
            mock.l2ChainInfo = mockL2Info;
            break;
        case 1:
            mock.metadata = mockMetadata;
            break;
        case 2:
            mock.l2ChainInfo = mockL2Info;
            break;
        default:
            break;
    }

    return mock;
};
