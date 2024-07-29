import { Test, TestingModule } from "@nestjs/testing";

import { CoingeckoService } from "./coingecko.service";

describe("CoingeckoService", () => {
    let service: CoingeckoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: CoingeckoService,
                    useFactory: () => {
                        const apiKey = "COINGECKO_API_KEY";
                        const apiBaseUrl = "https://api.coingecko.com/api/v3/";
                        return new CoingeckoService(apiKey, apiBaseUrl);
                    },
                },
            ],
        }).compile();

        service = module.get<CoingeckoService>(CoingeckoService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
