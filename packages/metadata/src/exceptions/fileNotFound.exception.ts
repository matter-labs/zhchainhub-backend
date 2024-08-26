export class FileNotFound extends Error {
    constructor(path: string) {
        super(`File not found at path: ${path}`);
    }
}
