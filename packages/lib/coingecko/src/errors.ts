import { BaseError } from "@zkchainhub/errors";

export class CoingeckoError extends BaseError {
    constructor(description: string) {
        super({ name: "CoingeckoError", description });
    }
}
