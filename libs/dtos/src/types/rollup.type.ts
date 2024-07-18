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
