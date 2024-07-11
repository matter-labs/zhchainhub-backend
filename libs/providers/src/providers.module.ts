import { Module } from "@nestjs/common";

import { EvmProviderService } from "./evmProvider.service";

@Module({
    providers: [EvmProviderService],
    exports: [EvmProviderService],
})
export class ProvidersModule {}
