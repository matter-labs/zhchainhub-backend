import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const zodErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation error",
            errors: err.errors.map((error) => ({
                path: error.path.join("."),
                message: error.message,
            })),
        });
    }

    // If the error isn't a ZodError, pass it to the next error handler
    next(err);
};
