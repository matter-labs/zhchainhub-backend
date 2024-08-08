export class L1MetricsServiceException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "L1MetricsServiceException";
    }
}
