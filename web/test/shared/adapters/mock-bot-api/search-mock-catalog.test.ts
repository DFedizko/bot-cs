import { describe, expect, it } from "bun:test";
import { createMockCatalog } from "@/shared/adapters/mock-bot-api/create-mock-catalog";
import { searchMockCatalog } from "@/shared/adapters/mock-bot-api/search-mock-catalog";

const VANILLA_KARAMBIT = "★ Karambit";
const DOPPLER_FN = "★ Karambit | Doppler (Factory New)";
const SMALL_LIMIT = 3;

const namesFor = (text: string, limit?: number) =>
    searchMockCatalog(createMockCatalog(), text, limit).map(({ marketHashName }) => marketHashName);

describe("searchMockCatalog", () => {
    it("Should find the items holding every word, ignoring case and bars", () => {
        expect(namesFor("KARAMBIT doppler factory")).toEqual([
            DOPPLER_FN,
            "★ StatTrak™ Karambit | Doppler (Factory New)",
        ]);
    });

    it("Should list the names that start with the text first", () => {
        expect(namesFor("★ karambit").at(0)).toBe(VANILLA_KARAMBIT);
    });

    it("Should answer at most the asked limit", () => {
        expect(namesFor("awp", SMALL_LIMIT)).toHaveLength(SMALL_LIMIT);
    });

    it("Should find nothing for a word no item holds", () => {
        expect(namesFor("karambti dopler")).toEqual([]);
    });
});
