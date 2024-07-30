import { Module } from "@nestjs/common";

import { LoggerModule } from "@zkchainhub/shared";

import { CoingeckoService } from "./services";

@Module({
    imports: [LoggerModule],
    providers: [CoingeckoService],
    exports: [CoingeckoService],
})
export class PricingModule {}
