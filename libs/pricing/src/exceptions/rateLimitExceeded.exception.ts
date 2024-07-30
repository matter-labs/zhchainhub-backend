import { HttpException, HttpStatus } from "@nestjs/common";

export class RateLimitExceeded extends HttpException {
    constructor() {
        super("Rate limit exceeded.", HttpStatus.TOO_MANY_REQUESTS);
    }
}
