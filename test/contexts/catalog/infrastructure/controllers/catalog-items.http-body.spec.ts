import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import { mapToCatalogItemsBody } from "@/contexts/catalog/infrastructure/controllers/catalog-items.http-body";
import { catalogRow } from "../../application/__builders__/catalog-row.builder";

describe("mapToCatalogItemsBody", () => {
    it.each([
        [Rarity.CONSUMER_GRADE, "consumer"],
        [Rarity.INDUSTRIAL_GRADE, "industrial"],
        [Rarity.MIL_SPEC_GRADE, "milspec"],
        [Rarity.RESTRICTED, "restricted"],
        [Rarity.CLASSIFIED, "classified"],
        [Rarity.COVERT, "covert"],
        [Rarity.EXTRAORDINARY, "extraordinary"],
        [Rarity.CONTRABAND, "contraband"],
    ] as const)("Should answer the rarity %s with the API key %s", (rarity, key) => {
        const body = mapToCatalogItemsBody({ items: [catalogRow({ rarity })] });

        expect(body.items.map((item) => item.rarity)).toEqual([key]);
    });

    it("Should keep every other field of the item as it is", () => {
        const { rarity, ...rest } = catalogRow();

        const body = mapToCatalogItemsBody({ items: [{ ...rest, rarity }] });

        expect(body).toEqual({ items: [{ ...rest, rarity: "covert" }] });
    });

    it("Should answer no items when nothing was found", () => {
        const body = mapToCatalogItemsBody({ items: [] });

        expect(body).toEqual({ items: [] });
    });
});
