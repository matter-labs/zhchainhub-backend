import cors from "cors";
import express, { json } from "express";

import { ILogger } from "@zkchainhub/shared";

import { listRoutes, setupOpenApiConfiguration as setupOpenApi } from "./api-docs/index.js";
import { ConfigType } from "./common/config/index.js";
import { requestLogger } from "./common/middleware/requestLogger.middleware.js";
import { zodErrorHandler } from "./common/middleware/zodError.middleware.js";
import { BaseRouter } from "./common/routes/baseRouter.js";

export class App {
    public app;
    public port: number;
    public env: string;

    constructor(
        private readonly config: ConfigType,
        routes: BaseRouter[],
        private readonly logger: ILogger,
    ) {
        this.app = express();
        this.port = config.port;
        this.env = process.env.NODE_ENV || "development";

        this.initializeMiddlewares();
        this.initializeOpenApi();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }

    public listen(): void {
        listRoutes(this.app, this.logger);

        this.app.listen(this.port, () => {
            this.logger.info(`=================================`);
            this.logger.info(`======= ENV: ${this.env} =======`);
            this.logger.info(`🚀 ZKchainHub listening port ${this.port}`);
            this.logger.info(`=================================`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares(): void {
        this.app.use(requestLogger);
        this.app.use(json());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(routes: BaseRouter[]): void {
        routes.forEach((route) => {
            this.app.use(route.prefix, route.router);
        });
    }

    private initializeOpenApi(): void {
        setupOpenApi(this.app);
    }

    private initializeErrorHandling(): void {
        this.app.use(zodErrorHandler);
    }
}
