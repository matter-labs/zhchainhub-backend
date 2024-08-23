export class InvalidSchema extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidSchema";
    }
}
