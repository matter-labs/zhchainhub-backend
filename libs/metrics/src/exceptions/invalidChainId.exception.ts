export class InvalidChainId extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidChainId";
    }
}
