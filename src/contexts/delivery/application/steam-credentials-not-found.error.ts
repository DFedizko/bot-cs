import { BaseError } from "@/packages/building-blocks/base-error";

export class SteamCredentialsNotFoundError extends BaseError {
    constructor(accountId: number) {
        super({ message: `No Steam credentials for the account "${accountId}"`, code: "STEAM_CREDENTIALS_NOT_FOUND" });
    }
}
