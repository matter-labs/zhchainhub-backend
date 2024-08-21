export class ChainNotFound extends Error {
    constructor(chainId: bigint) {
        super(`Chain with id ${chainId.toString()} not found on the current ecosystem.`);
    }
}
