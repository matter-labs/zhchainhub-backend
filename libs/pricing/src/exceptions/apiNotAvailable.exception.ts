import { HttpException, HttpStatus } from "@nestjs/common";

export class ApiNotAvailable extends HttpException {
    constructor(apiName: string) {
        super(`The ${apiName} API is not available.`, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
