import { Injectable } from "@nestjs/common";

import { IPricingService } from "@zkchainhub/pricing/interfaces";

@Injectable()
export class CoingeckoService implements IPricingService {
    constructor(
        private readonly apiKey: string,
        private readonly apiBaseUrl: string = "https://api.coingecko.com/api/v3/",
    ) {}

    async getTokenPrices(
        _tokenIds: string[],
        _config: { currency: string } = { currency: "usd" },
    ): Promise<Record<string, number>> {
        throw new Error("Method not implemented.");
    }
}
