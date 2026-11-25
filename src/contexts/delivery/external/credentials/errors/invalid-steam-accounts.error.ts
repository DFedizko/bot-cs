import { BaseError } from "@/packages/building-blocks/base-error";

export class InvalidSteamAccountsError extends BaseError {
    constructor(fields: string) {
        super({ message: `Invalid STEAM_ACCOUNTS: ${fields}`, code: "INVALID_STEAM_ACCOUNTS" });
    }
}
