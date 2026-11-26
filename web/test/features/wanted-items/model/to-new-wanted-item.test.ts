import { describe, expect, it } from "bun:test";
import { toNewWantedItem } from "@/features/wanted-items/model/to-new-wanted-item";
import { wantedItemDraftBuilder } from "../__builders__/wanted-item-draft.builder";

const NAME = "AWP | Asiimov (Field-Tested)";

describe("toNewWantedItem", () => {
    it("Should send a percentage max as a number", () => {
        const draft = wantedItemDraftBuilder({ percentage: "−3" });

        expect(toNewWantedItem(NAME, draft).maxFor).toEqual({ type: "percentage", value: -3 });
    });

    it("Should send a max value of whole coins in coin cents", () => {
        const draft = wantedItemDraftBuilder({ maxMode: "value", value: "10" });

        expect(toNewWantedItem(NAME, draft).maxFor).toEqual({ type: "value", value: 1000 });
    });

    it("Should ask for the chosen wear", () => {
        expect(toNewWantedItem(NAME, wantedItemDraftBuilder()).criteria).toEqual([
            { type: "IsWear", value: "Field-Tested" },
        ]);
    });

    it("Should ask for no wear when any wear will do", () => {
        expect(toNewWantedItem(NAME, wantedItemDraftBuilder({ wear: null })).criteria).toEqual([]);
    });

    it("Should keep whether the bot starts bidding", () => {
        expect(toNewWantedItem(NAME, wantedItemDraftBuilder({ enabled: false })).enabled).toBe(false);
    });
});
