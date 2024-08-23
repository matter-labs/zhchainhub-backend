import { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";

const DEFAULT_TTL = 60; // 1 minute
const cache = new NodeCache();

//FIXME: This is a temporary cache implementation. It is not recommended for production use.
// might be replaced with a more robust solution in the future.
/**
 * A middleware that caches responses for a given time to live (TTL).
 * @param args - The time to live (TTL) in seconds for the cached response.
 * @returns A middleware function that caches responses for a given time to live (TTL).
 */
export function cacheMiddleware(args: { ttl: number } = { ttl: DEFAULT_TTL }) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const key = req.originalUrl || req.url;
        const cachedResponse = await cache.get(key);
        if (cachedResponse) {
            // Check if the cached response is a JSON object or plain text
            res.json(cachedResponse);
        } else {
            // Store the original send and json functions
            const originalJson = res.json.bind(res);
            // Override the json function

            res.json = (body): Response => {
                // Cache the response body
                cache.set(key, body, args.ttl);
                // Call the original json function with the response body
                return originalJson(body);
            };

            next();
        }
    };
}
