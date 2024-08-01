import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";

import { LoggerModule } from "@zkchainhub/shared";
import { TOKEN_CACHE_TTL_IN_SEC } from "@zkchainhub/shared/constants/";

import { CoingeckoService } from "./services";

@Module({
    imports: [
        LoggerModule,
        CacheModule.register({
            store: "memory",
            ttl: TOKEN_CACHE_TTL_IN_SEC,
        }),
    ],
    providers: [CoingeckoService],
    exports: [CoingeckoService],
})
export class PricingModule {}
