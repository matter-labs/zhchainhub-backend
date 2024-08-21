export class RateLimitExceeded extends Error {
    constructor() {
        super("Rate limit exceeded.");
    }
}
