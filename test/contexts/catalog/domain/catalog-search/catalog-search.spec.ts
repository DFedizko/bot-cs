import { CatalogSearch } from "@/contexts/catalog/domain/catalog-search/catalog-search";

const ASIIMOV = "AWP | Asiimov (Field-Tested)";
const STATTRAK_ASIIMOV = "StatTrak™ AWP | Asiimov (Field-Tested)";
const ASIIMOV_WELL_WORN = "AWP | Asiimov (Well-Worn)";
const DRAGON_LORE = "AWP | Dragon Lore (Factory New)";
const REDLINE = "AK-47 | Redline (Field-Tested)";
const KARAMBIT = "★ Karambit";
const TWO = 2;

const named = (...names: string[]) => names.map((marketHashName) => ({ marketHashName }));
const namesOf = (items: { marketHashName: string }[]) => items.map(({ marketHashName }) => marketHashName);

describe("CatalogSearch", () => {
    describe("matching", () => {
        it("Should find the items whose market name holds every word of the text", () => {
            const found = new CatalogSearch("awp asii").find(named(ASIIMOV, DRAGON_LORE, REDLINE));

            expect(namesOf(found)).toEqual([ASIIMOV]);
        });

        it("Should ignore the case of the text and of the market name", () => {
            const found = new CatalogSearch("AwP AsIi").find(named(ASIIMOV));

            expect(namesOf(found)).toEqual([ASIIMOV]);
        });

        it("Should find the words in any order", () => {
            const found = new CatalogSearch("asiimov awp").find(named(ASIIMOV, DRAGON_LORE));

            expect(namesOf(found)).toEqual([ASIIMOV]);
        });

        it("Should ignore the bars and parentheses of the text and of the market name", () => {
            const found = new CatalogSearch("awp | asiimov (field-tested)").find(named(ASIIMOV, ASIIMOV_WELL_WORN));

            expect(namesOf(found)).toEqual([ASIIMOV]);
        });

        it("Should find nothing when one word of the text is missing", () => {
            const found = new CatalogSearch("awp redline").find(named(ASIIMOV, REDLINE));

            expect(found).toEqual([]);
        });

        it("Should find names with symbols the text doesn't type", () => {
            const found = new CatalogSearch("karambit").find(named(KARAMBIT, REDLINE));

            expect(namesOf(found)).toEqual([KARAMBIT]);
        });
    });

    describe("ordering", () => {
        it("Should list the names that start with the text first, then the rest", () => {
            const found = new CatalogSearch("awp asiimov").find(named(STATTRAK_ASIIMOV, ASIIMOV));

            expect(namesOf(found)).toEqual([ASIIMOV, STATTRAK_ASIIMOV]);
        });

        it("Should list each group alphabetically", () => {
            const found = new CatalogSearch("awp").find(named(DRAGON_LORE, STATTRAK_ASIIMOV, ASIIMOV_WELL_WORN, ASIIMOV));

            expect(namesOf(found)).toEqual([ASIIMOV, ASIIMOV_WELL_WORN, DRAGON_LORE, STATTRAK_ASIIMOV]);
        });
    });

    describe("limit", () => {
        it("Should find at most the default limit of items", () => {
            const names = Array.from({ length: CatalogSearch.DEFAULT_LIMIT + 1 }, (_, index) => `AWP | Skin ${index}`);

            const found = new CatalogSearch("awp").find(named(...names));

            expect(found).toHaveLength(CatalogSearch.DEFAULT_LIMIT);
        });

        it("Should find at most the given number of items, the first in order", () => {
            const found = new CatalogSearch("awp").find(named(DRAGON_LORE, ASIIMOV_WELL_WORN, ASIIMOV), TWO);

            expect(namesOf(found)).toEqual([ASIIMOV, ASIIMOV_WELL_WORN]);
        });
    });

    it("Should give back the items it finds as they are", () => {
        const asiimov = { marketHashName: ASIIMOV, imageUrl: "https://example.com/asiimov.png" };

        const found = new CatalogSearch("asiimov").find([asiimov]);

        expect(found[0]).toBe(asiimov);
    });
});
