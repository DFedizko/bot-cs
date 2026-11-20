import { BaseError } from "@/packages/building-blocks/base-error";

export class SteamLoginError extends BaseError {
    constructor(reason: string) {
        super({ message: `Steam refused the login: ${reason}`, code: "STEAM_LOGIN_REFUSED" });
    }
}
