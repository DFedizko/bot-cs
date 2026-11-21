import { DomainError } from "@/packages/error/domain-error";

export class InvalidSteamIdError extends DomainError {
    constructor(value: string) {
        super({ message: `"${value}" is not a Steam id 64`, code: "INVALID_STEAM_ID" });
    }
}
