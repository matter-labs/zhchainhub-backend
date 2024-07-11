import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ProvidersModule } from "@packages/providers";

import { ApiController } from "./api.controller";
import { RequestLoggerMiddleware } from "./common/middleware/request.middleware";

@Module({
    imports: [ProvidersModule],
    controllers: [ApiController],
    providers: [],
})
export class ApiModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).exclude("/docs", "/docs/(.*)").forRoutes("*");
    }
}
