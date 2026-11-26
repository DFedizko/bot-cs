import { describe, expect, it } from "bun:test";
import { isAlreadyWanted } from "@/features/wanted-items/model/is-already-wanted";
import { HttpError } from "@/shared/lib/http/http-error";

describe("isAlreadyWanted", () => {
    it("Should know the bot refused an item the account already wants", () => {
        expect(isAlreadyWanted(new HttpError({ status: 409, code: "WANTED_ITEM_ALREADY_EXISTS", message: "" }))).toBe(
            true,
        );
    });

    it("Should not mistake another failure for it", () => {
        expect(isAlreadyWanted(new HttpError({ status: 500, code: "INTERNAL_ERROR", message: "" }))).toBe(false);
    });

    it("Should not mistake no failure for it", () => {
        expect(isAlreadyWanted(null)).toBe(false);
    });
});
