import { Module } from "@nestjs/common";

import { CoingeckoService } from "./services";

@Module({
    providers: [CoingeckoService],
    exports: [CoingeckoService],
})
export class PricingModule {}
