export type GasInfo = {
    gasPrice: bigint; // wei
    ethPrice?: number; // USD
    ethTransferGas: bigint; // units of gas
    erc20TransferGas: bigint; // units of gas
};
