import { NextFunction, Request, Response } from "express";

import { Logger } from "@zkchainhub/shared";

const logger = Logger.getInstance();

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const method = req.method;
    const path = req.path;
    const query = JSON.stringify(req.query);

    const logMessage = `${method} ${path} - Query: ${query}`;

    logger.info(logMessage);

    next();
};
