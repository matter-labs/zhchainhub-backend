import { isNativeError } from "util/types";
import { NextFunction, Request, Response } from "express";

export const generalErrorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
) => {
    return res.status(500).json({
        message: "Internal server error",
        errors: isNativeError(err) ? err.message : err,
    });
};
