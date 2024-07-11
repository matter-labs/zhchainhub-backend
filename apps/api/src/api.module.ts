import { Module } from "@nestjs/common";
import { ProvidersModule } from "@packages/providers";

import { ApiController } from "./api.controller";

@Module({
    imports: [ProvidersModule],
    controllers: [ApiController],
    providers: [],
})
export class ApiModule {}
