import { z } from "zod";

import { ILogger } from "@zkchainhub/shared";

import { cacheMiddleware } from "../../common/middleware/cache.middleware.js";
import { BaseRouter } from "../../common/routes/baseRouter.js";
import { ChainNotFound, MetricsController } from "../index.js";

const ChainIdSchema = z.object({
    params: z.object({
        chainId: z
            .number({ required_error: "Chain ID is required", coerce: true })
            .positive("Chain ID must be positive integer")
            .int("Chain ID must be a positive integer"),
    }),
});

export class MetricsRouter extends BaseRouter {
    constructor(
        private readonly metricsController: MetricsController,
        private readonly logger: ILogger,
    ) {
        super("/metrics");
    }

    protected initializeRoutes(): void {
        /**
         * Retrieves the ecosystem information.
         * @returns {Promise<EcosystemInfo>} The ecosystem information.
         */
        this.router.get("/ecosystem", cacheMiddleware(), async (_req, res, next) => {
            try {
                const data = await this.metricsController.getEcosystem();
                res.json(data);
            } catch (error: unknown) {
                this.logger.error(JSON.stringify(error));
                next(error);
            }
        });

        /**
         * Retrieves the chain information for the specified chain ID.
         * @param {number} chainId - The ID of the chain.
         * @returns {Promise<ZKChainInfo>} The chain information.
         */
        this.router.get("/zkchain/:chainId", cacheMiddleware(), async (req, res, next) => {
            try {
                const { params } = ChainIdSchema.parse(req);

                const data = await this.metricsController.getChain(params.chainId);
                res.json(data);
            } catch (error: unknown) {
                if (error instanceof ChainNotFound) {
                    return res.status(404).json({
                        message: error.message,
                    });
                }
                next(error);
            }
        });
    }
}
