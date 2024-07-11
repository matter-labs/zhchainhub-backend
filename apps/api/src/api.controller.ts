import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EvmProviderService } from "@packages/providers";

@ApiTags("api")
@Controller()
export class ApiController {
    constructor(private readonly evmProvider: EvmProviderService) {}

    @Get()
    getTvl() {
        return this.evmProvider.getTvl();
    }
}
