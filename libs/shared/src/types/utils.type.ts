import { Address } from "abitype";
import { AbiItem } from "viem";

export type AbiWithAddress<T extends AbiItem[]> = { abi: T; address: Address };

export type ChainId = bigint;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
