import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupOpenApiConfiguration = (app: INestApplication<any>) => {
    const config = new DocumentBuilder()
        .setTitle("ZKchainHub API")
        .setDescription("Documentation for ZKchainHub API")
        .setVersion("1.0")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document, {
        customSiteTitle: "ZKchainHub API Documentation",
    });
};
