import { BaseError } from "@/packages/building-blocks/base-error";

export class SteamTradeError extends BaseError {
    constructor(message: string) {
        super({ message, code: "STEAM_TRADE_ERROR" });
    }
}
