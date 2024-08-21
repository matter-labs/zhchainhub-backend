export class ApiNotAvailable extends Error {
    constructor(apiName: string) {
        super(`The ${apiName} API is not available.`);
    }
}
