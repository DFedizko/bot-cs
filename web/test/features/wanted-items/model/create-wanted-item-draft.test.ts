import { describe, expect, it } from "bun:test";
import { createWantedItemDraft } from "@/features/wanted-items/model/create-wanted-item-draft";
import { catalogItemBuilder } from "../__builders__/catalog-item.builder";

describe("createWantedItemDraft", () => {
    it("Should start at 3% below the recommended price, enabled, with the item's wear", () => {
        expect(createWantedItemDraft(catalogItemBuilder({ wear: "Minimal Wear" }))).toEqual({
            maxMode: "percentage",
            percentage: "-3",
            value: "",
            wear: "Minimal Wear",
            enabled: true,
        });
    });
});
