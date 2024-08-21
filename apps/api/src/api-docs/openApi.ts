import fs from "fs";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { parse as parseYaml } from "yaml";

export const setupOpenApiConfiguration = (app: Express) => {
    const file = fs.readFileSync("./src/api-docs/swagger.yaml", "utf8");
    const swaggerSpec = parseYaml(file);

    app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customSiteTitle: "ZKchainHub API Documentation",
        }),
    );
};
