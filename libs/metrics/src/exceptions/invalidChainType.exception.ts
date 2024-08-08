import { Chains } from "@zkchainhub/shared";

export class InvalidChainType extends Error {
    constructor(index: number) {
        super(`Current supported types are [${Chains.join(
            ", ",
        )}], but received index ${index}. Verify if supported chains are consistent with https://github.com/matter-labs/era-contracts/blob/8a70bbbc48125f5bde6189b4e3c6a3ee79631678/l1-contracts/contracts/state-transition/chain-deps/ZkSyncHyperchainStorage.sol#L39
`);
        this.name = "InvalidChainType";
    }
}
