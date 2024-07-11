import { Test, TestingModule } from "@nestjs/testing";

import { EvmProviderService } from "./evmProvider.service";

describe("EvmProviderService", () => {
    let service: EvmProviderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EvmProviderService],
        }).compile();

        service = module.get<EvmProviderService>(EvmProviderService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should return the correct TVL", async () => {
        const tvl = await service.getTvl();
        expect(tvl).toBe(1);
    });
});
