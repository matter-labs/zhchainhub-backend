export class ProviderException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProviderException";
    }
}

export class L1ProviderException extends ProviderException {
    constructor(message: string) {
        super(message);
        this.name = "L1ProviderException";
    }
}
