import { Test, TestingModule } from "@nestjs/testing";
import { EvmProviderService } from "@packages/providers";

import { ApiController } from "./api.controller";

describe("ApiController", () => {
    let apiController: ApiController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [ApiController],
            providers: [EvmProviderService],
        }).compile();

        apiController = app.get<ApiController>(ApiController);
    });

    describe("root", () => {
        it("should return 1", async () => {
            expect(await apiController.getTvl()).toBe(1);
        });
    });
});
