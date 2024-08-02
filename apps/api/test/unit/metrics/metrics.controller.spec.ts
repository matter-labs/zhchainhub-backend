import { Test, TestingModule } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { MetricsController } from "../../../src/metrics/metrics.controller";
import { getEcosystemInfo, getZKChainInfo } from "../../../src/metrics/mocks/metrics.mock";

export const mockLogger: Partial<Logger> = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

describe("MetricsController", () => {
    let controller: MetricsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: WINSTON_MODULE_PROVIDER,
                    useValue: mockLogger,
                },
            ],
            controllers: [MetricsController],
        }).compile();

        controller = module.get<MetricsController>(MetricsController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("getEcosystem", () => {
        it("should return the ecosystem information", async () => {
            const expectedInfo = getEcosystemInfo();

            const result = await controller.getEcosystem();

            expect(result).toEqual(expectedInfo);
        });
    });

    describe("getChain", () => {
        it("should return the chain information for the specified chain ID", async () => {
            const chainId = 123;
            const expectedInfo = getZKChainInfo(chainId);

            const result = await controller.getChain(chainId);

            expect(result).toEqual(expectedInfo);
        });
    });
});
