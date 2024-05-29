import { BaseError } from "@zkchainhub/errors";

export default class LambdaError extends BaseError {
    constructor(description: string) {
        super({ name: "LambdaError", description });
    }
}
