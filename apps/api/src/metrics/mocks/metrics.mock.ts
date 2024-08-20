import { EcosystemInfo, L2ChainInfo, ZKChainInfo, ZkChainMetadata } from "../dto/response";

export const getEcosystemInfo = () => {
    const mock = new EcosystemInfo({
        l1Tvl: [],
        ethGasInfo: {
            gasPrice: "50",
            ethTransfer: "21000",
            erc20Transfer: "65000",
        },
        zkChains: [
            {
                chainId: "0",
                chainType: "Rollup",
                tvl: "1000000000.123123123123",
                rpc: true,
            },
            {
                chainId: "1",
                chainType: "Validium",
                tvl: "1000000000.123123123123",
                rpc: false,
            },
            {
                chainId: "2",
                chainType: "Rollup",
                tvl: "1000000000.123123123123",
                rpc: true,
            },
            {
                chainId: "3",
                chainType: "Rollup",
                tvl: "1000000000.123123123123",
                rpc: false,
            },
        ],
    });
    return mock;
};

const mockZkChainMetada: ZkChainMetadata = {
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png",
    name: "ZKsyncERA",
    publicRpcs: [
        "https://mainnet.era.zksync.io",
        "https://1rpc.io/zksync2-era",
        "https://zksync.drpc.org",
    ],
    explorerUrl: "https://explorer.zksync.io/",
    launchDate: 1679626800,
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
        tvl: [],
        batchesInfo: {
            commited: "100",
            verified: "90",
            executed: "80",
        },
        feeParams: {
            batchOverheadL1Gas: 50000,
            maxPubdataPerBatch: 120000,
            maxL2GasPerBatch: 10000000,
            priorityTxMaxPubdata: 15000,
            minimalL2GasPrice: "1000000000000000000",
        },
    });
    switch (chainId) {
        case 0:
            mock.metadata = mockZkChainMetada;
            mock.l2ChainInfo = mockL2Info;
            break;
        case 1:
            mock.metadata = mockZkChainMetada;
            break;
        case 2:
            mock.l2ChainInfo = mockL2Info;
            break;
        default:
            break;
    }

    return mock;
};
