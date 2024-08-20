import { HttpException, HttpStatus } from "@nestjs/common";

export class ChainNotFound extends HttpException {
    constructor(chainId: bigint) {
        super(
            `Chain with id ${chainId.toString()} not found on the current ecosystem.`,
            HttpStatus.NOT_FOUND,
        );
    }
}
