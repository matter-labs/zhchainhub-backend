import { NestFactory } from "@nestjs/core";
import { setupOpenApiConfiguration } from "apps/api/src/docs";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { ApiModule } from "./api.module";

async function bootstrap() {
    const app = await NestFactory.create(ApiModule);
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    setupOpenApiConfiguration(app);

    await app.listen(3000);
}
bootstrap();
