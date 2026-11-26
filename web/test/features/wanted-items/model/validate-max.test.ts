import { describe, expect, it } from "bun:test";
import { validateMax } from "@/features/wanted-items/model/validate-max";
import { wantedItemDraftBuilder } from "../__builders__/wanted-item-draft.builder";

const percentage = (value: string) => validateMax(wantedItemDraftBuilder({ maxMode: "percentage", percentage: value }));
const coins = (value: string) => validateMax(wantedItemDraftBuilder({ maxMode: "value", value }));

describe("validateMax", () => {
    it.each(["-3", "−3", "0", "+2", "2.5"])("Should accept %s as a percentage", (value) => {
        expect(percentage(value)).toBeNull();
    });

    it.each(["", "a lot", "-", "3%"])("Should ask for a number when the percentage is %p", (value) => {
        expect(percentage(value)).toBe("Enter a percentage, like −3");
    });

    it("Should refuse a percentage that pays nothing", () => {
        expect(percentage("-100")).toBe("The max must be above −100%");
    });

    it("Should accept a whole number of coins", () => {
        expect(coins("10")).toBeNull();
    });

    it.each(["", "0", "-5", "2.5", "ten", "99999999999999999"])(
        "Should ask for whole coins above zero when the value is %p",
        (value) => {
            expect(coins(value)).toBe("Enter a whole number of coins above zero");
        },
    );
});
