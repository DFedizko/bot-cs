import { describe, expect, it } from "bun:test";
import { listMockWantedItems } from "@/shared/adapters/mock-bot-api/list-mock-wanted-items";
import { mockWantedItemBuilder } from "./__builders__/mock-wanted-item.builder";

const NEWEST = mockWantedItemBuilder({ name: "B newest", addedAt: "2026-11-20T00:00:00.000Z" });
const MIDDLE = mockWantedItemBuilder({ name: "C middle", addedAt: "2026-11-19T00:00:00.000Z", enabled: false });
const OLDEST = mockWantedItemBuilder({ name: "A oldest", addedAt: "2026-11-18T00:00:00.000Z" });
const ITEMS = [MIDDLE, OLDEST, NEWEST];

const COVERT = {
    rarity: "Covert",
    weapon: "AWP",
    skin: "Asiimov",
    wear: null,
    stattrak: false,
    souvenir: false,
} as const;
const catalogOf = (rarity: "Covert" | "Restricted" | "Contraband") => ({
    ...COVERT,
    imageUrl: "https://x.test/a.png",
    rarity,
});

const namesOf = (query: Parameters<typeof listMockWantedItems>[1], items = ITEMS) =>
    listMockWantedItems(items, query).items.map(({ name }) => name);

describe("listMockWantedItems", () => {
    it("Should list the newest items first by default", () => {
        expect(namesOf({})).toEqual([NEWEST.name, MIDDLE.name, OLDEST.name]);
    });

    it("Should list only the enabled items when asked", () => {
        expect(namesOf({ enabled: "true" })).toEqual([NEWEST.name, OLDEST.name]);
    });

    it("Should list only the paused items when asked", () => {
        expect(namesOf({ enabled: "false" })).toEqual([MIDDLE.name]);
    });

    it("Should count every item whatever the filter", () => {
        const page = listMockWantedItems(ITEMS, { enabled: "false" });

        expect(page.counts).toEqual({ all: 3, enabled: 2, disabled: 1 });
    });

    it("Should sort by name alphabetically", () => {
        expect(namesOf({ sort: "name", order: "asc" })).toEqual([OLDEST.name, NEWEST.name, MIDDLE.name]);
    });

    it("Should rank percentage maxes below fixed values, each lowest first", () => {
        const items = [
            mockWantedItemBuilder({ name: "value", maxFor: { type: "value", value: 100 } }),
            mockWantedItemBuilder({ name: "plus", maxFor: { type: "percentage", value: "2" } }),
            mockWantedItemBuilder({ name: "minus", maxFor: { type: "percentage", value: "-5" } }),
        ];

        expect(namesOf({ sort: "max", order: "asc" }, items)).toEqual(["minus", "plus", "value"]);
    });

    it("Should rank rarities in the official order, unknown items lowest, highest first when descending", () => {
        const items = [
            mockWantedItemBuilder({ name: "restricted", catalog: catalogOf("Restricted") }),
            mockWantedItemBuilder({ name: "unknown" }),
            mockWantedItemBuilder({ name: "contraband", catalog: catalogOf("Contraband") }),
            mockWantedItemBuilder({ name: "covert", catalog: catalogOf("Covert") }),
        ];

        expect(namesOf({ sort: "rarity", order: "desc" }, items)).toEqual([
            "contraband",
            "covert",
            "restricted",
            "unknown",
        ]);
    });

    it("Should keep items that tie newest first", () => {
        expect(namesOf({ sort: "max", order: "desc" })).toEqual([NEWEST.name, MIDDLE.name, OLDEST.name]);
    });

    it("Should answer the requested page with the total that matches", () => {
        const page = listMockWantedItems(ITEMS, { page: "2", pageSize: "2" });

        expect(page).toMatchObject({ items: [OLDEST], page: 2, pageSize: 2, total: 3 });
    });
});
