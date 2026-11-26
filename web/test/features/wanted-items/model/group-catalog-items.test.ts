import { describe, expect, it } from "bun:test";
import { groupCatalogItems } from "@/features/wanted-items/model/group-catalog-items";
import { catalogItemBuilder } from "../__builders__/catalog-item.builder";

const AWP = catalogItemBuilder();
const AK = catalogItemBuilder({ marketHashName: "AK-47 | Redline (Field-Tested)", category: "Rifles" });
const OTHER_AWP = catalogItemBuilder({ marketHashName: "AWP | Asiimov (Well-Worn)" });

describe("groupCatalogItems", () => {
    it("Should group the items by category, in the order the categories first appear", () => {
        expect(groupCatalogItems([AWP, AK, OTHER_AWP])).toEqual([
            { category: "Sniper Rifles", items: [AWP, OTHER_AWP] },
            { category: "Rifles", items: [AK] },
        ]);
    });

    it("Should make no group without items", () => {
        expect(groupCatalogItems([])).toEqual([]);
    });
});
