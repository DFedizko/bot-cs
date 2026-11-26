import { describe, expect, it } from "bun:test";
import { toCatalogItemView } from "@/features/wanted-items/model/to-catalog-item-view";
import { catalogItemBuilder } from "../__builders__/catalog-item.builder";

describe("toCatalogItemView", () => {
    it("Should name the item without its wear", () => {
        const item = catalogItemBuilder({ marketHashName: "StatTrak™ AWP | Asiimov (Field-Tested)", stattrak: true });

        expect(toCatalogItemView(item)).toMatchObject({ title: "StatTrak™ AWP | Asiimov", tone: "covert" });
    });

    it("Should name a vanilla knife by itself", () => {
        const item = catalogItemBuilder({ marketHashName: "★ Karambit", weapon: "Karambit", skin: null, wear: null });

        expect(toCatalogItemView(item).title).toBe("★ Karambit");
    });
});
