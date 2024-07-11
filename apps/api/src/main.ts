import { NestFactory } from "@nestjs/core";
import { setupOpenApiConfiguration } from "apps/api/src/docs";

import { ApiModule } from "./api.module";

async function bootstrap() {
    const app = await NestFactory.create(ApiModule);

    setupOpenApiConfiguration(app);

    await app.listen(3000);
}
bootstrap();
