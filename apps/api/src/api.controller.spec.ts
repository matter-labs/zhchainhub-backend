import { createMock } from "@golevelup/ts-jest";
import { Test, TestingModule } from "@nestjs/testing";
import { EvmProviderService } from "@packages/providers";

import { ApiController } from "./api.controller";

describe("ApiController", () => {
    let apiController: ApiController;
    let evmProvider: EvmProviderService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [ApiController],
            providers: [
                {
                    provide: EvmProviderService,
                    useValue: createMock<EvmProviderService>(),
                },
            ],
        }).compile();

        apiController = app.get<ApiController>(ApiController);
        evmProvider = app.get<EvmProviderService>(EvmProviderService);
    });

    describe("root", () => {
        it("should return 50", async () => {
            jest.spyOn(evmProvider, "getTvl").mockResolvedValue(50);
            expect(await apiController.getTvl()).toBe(50);
        });
    });
});
