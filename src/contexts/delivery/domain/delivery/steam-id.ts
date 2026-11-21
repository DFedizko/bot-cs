import { ValueObject } from "@/packages/building-blocks/value-object";
import { InvalidSteamIdError } from "./errors/invalid-steam-id.error";

const STEAM_ID_64 = /^7656119\d{10}$/;

export class SteamId extends ValueObject<string> {
    constructor(value: string) {
        if (!STEAM_ID_64.test(value)) throw new InvalidSteamIdError(value);
        super(value);
    }
}
