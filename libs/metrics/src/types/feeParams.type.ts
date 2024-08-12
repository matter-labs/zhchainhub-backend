//See: https://github.com/matter-labs/era-contracts/blob/8a70bbbc48125f5bde6189b4e3c6a3ee79631678/l1-contracts/contracts/state-transition/chain-deps/ZkSyncHyperchainStorage.sol#L52
export type FeeParams = {
    pubdataPricingMode: number;
    batchOverheadL1Gas: number;
    maxPubdataPerBatch: number;
    maxL2GasPerBatch: number;
    priorityTxMaxPubdata: number;
    minimalL2GasPrice?: bigint;
};

// Define the lengths for each field (in hex digits, each byte is 2 hex digits)
/* 
{
     pubdataPricingMode: uint8 -> 1 byte -> 2 hex digits
     batchOverheadL1Gas: uint32 -> 4 bytes -> 8 hex digits
     maxPubdataPerBatch: uint32 -> 4 bytes -> 8 hex digits
     maxL2GasPerBatch: uint32 -> 4 bytes -> 8 hex digits
     priorityTxMaxPubdata: uint32 -> 4 bytes -> 8 hex digits
     minimalL2GasPrice: uint64 -> 8 bytes -> 16 hex digits
 }
*/
export const feeParamsFieldHexDigits = [2, 8, 8, 8, 8, 16] as const;
