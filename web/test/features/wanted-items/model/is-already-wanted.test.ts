import { describe, expect, it } from "bun:test";
import { AlreadyWantedError } from "@/features/wanted-items/model/already-wanted.error";
import { isAlreadyWanted } from "@/features/wanted-items/model/is-already-wanted";

describe("isAlreadyWanted", () => {
    it("Should know the bot refused an item the account already wants", () => {
        expect(isAlreadyWanted(new AlreadyWantedError("AWP | Asiimov (Field-Tested)"))).toBe(true);
    });

    it("Should not mistake another failure for it", () => {
        expect(isAlreadyWanted(new Error("Something went wrong"))).toBe(false);
    });

    it("Should not mistake no failure for it", () => {
        expect(isAlreadyWanted(null)).toBe(false);
    });
});
