import { NestFactory } from "@nestjs/core";
import { setupOpenApiConfiguration } from "apps/api/src/docs";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { ApiModule } from "./api.module";

async function bootstrap() {
    const PORT = process.env.PORT || 3000;
    const app = await NestFactory.create(ApiModule);
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.enableCors({
        origin: "*", // Replace with the origin you want to allow
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    });

    setupOpenApiConfiguration(app);

    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

    logger.log(`Starting API server on port ${PORT}`);
    await app.listen(PORT);
}
bootstrap();
