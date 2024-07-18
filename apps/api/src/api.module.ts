import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ProvidersModule } from "@packages/providers";

import { ApiController } from "./api.controller";
import { RequestLoggerMiddleware } from "./common/middleware/request.middleware";
import { MetricsController } from "./metrics/metrics.controller";

/**
 * The main API module of the application.
 * Here we import all required modules and register the controllers for the ZKchainHub API.
 */
@Module({
    imports: [ProvidersModule],
    controllers: [ApiController, MetricsController],
    providers: [],
})
export class ApiModule implements NestModule {
    /**
     * Configures middleware for the module.
     * Applies RequestLoggerMiddleware to all routes except '/docs' and '/docs/(.*)'.
     *
     * @param {MiddlewareConsumer} consumer - The middleware consumer provided by NestJS.
     */
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).exclude("/docs", "/docs/(.*)").forRoutes("*");
    }
}
