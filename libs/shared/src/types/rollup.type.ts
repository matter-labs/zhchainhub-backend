// Chains should not change since it is a direct mapping of https://github.com/matter-labs/era-contracts/blob/8a70bbbc48125f5bde6189b4e3c6a3ee79631678/l1-contracts/contracts/state-transition/chain-deps/ZkSyncHyperchainStorage.sol#L39
/**
 * An array of supported chain types.
 * @readonly
 */
export const Chains = ["Rollup", "Validium"] as const;

/**
 * Represents the possible chain types.
 * This type is derived from the {@link Chains} array.
 * @typedef {typeof Chains[number]} ChainType
 */
export type ChainType = (typeof Chains)[number];
