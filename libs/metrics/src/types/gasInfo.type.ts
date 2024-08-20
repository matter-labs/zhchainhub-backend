export type GasInfo = {
    gasPrice: bigint; // wei
    ethPrice?: number; // USD
    ethTransfer: bigint; // units of gas
    erc20Transfer: bigint; // units of gas
};
