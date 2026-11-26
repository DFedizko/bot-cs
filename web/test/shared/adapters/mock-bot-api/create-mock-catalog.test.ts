import { describe, expect, it } from "bun:test";
import { createMockCatalog } from "@/shared/adapters/mock-bot-api/create-mock-catalog";
import { createMockWantedItems } from "@/shared/adapters/mock-bot-api/create-mock-wanted-items";

const findItem = (name: string) => createMockCatalog().find(({ marketHashName }) => marketHashName === name);

describe("createMockCatalog", () => {
    it("Should hold every catalogued wanted item", () => {
        const names = new Set(createMockCatalog().map(({ marketHashName }) => marketHashName));
        const wanted = createMockWantedItems().filter(({ catalog }) => catalog !== null);

        expect(wanted.every(({ name }) => names.has(name))).toBe(true);
    });

    it("Should file each item under its category", () => {
        expect(findItem("AWP | Asiimov (Field-Tested)")?.category).toBe("Sniper Rifles");
    });

    it("Should hold items nobody wants yet, without wear", () => {
        expect(findItem("★ Karambit")).toMatchObject({ skin: null, wear: null, category: "Knives" });
    });
});
