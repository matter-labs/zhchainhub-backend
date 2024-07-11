import { Controller, Get } from "@nestjs/common";
import { EvmProviderService } from "@packages/providers";

@Controller()
export class ApiController {
    constructor(private readonly evmProvider: EvmProviderService) {}

    @Get()
    getTvl() {
        return this.evmProvider.getTvl();
    }
}
