export class AlreadyWantedError extends Error {
    static readonly ERROR_NAME = "AlreadyWantedError";

    constructor(readonly itemName: string) {
        super(`The account already wants "${itemName}"`);
        this.name = AlreadyWantedError.ERROR_NAME;
    }
}
