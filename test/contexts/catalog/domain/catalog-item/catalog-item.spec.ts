import { CatalogItem } from "@/contexts/catalog/domain/catalog-item/catalog-item";
import { EmptyStringError } from "@/packages/error/empty-string.error";
import { catalogItemPrimitives } from "./__builders__/catalog-item.builder";

const BLANK = "  ";

describe("CatalogItem", () => {
    it("Should keep every detail it was created with", () => {
        const primitives = catalogItemPrimitives();

        const item = CatalogItem.create(primitives);

        expect(item.toPrimitives()).toEqual(primitives);
    });

    it("Should keep an item without skin or wear, such as a vanilla knife", () => {
        const vanilla = catalogItemPrimitives({ marketHashName: "★ Karambit", skin: null, wear: null });

        const item = CatalogItem.create(vanilla);

        expect(item.toPrimitives()).toEqual(vanilla);
    });

    it("Should trim the market name", () => {
        const item = CatalogItem.create(catalogItemPrimitives({ marketHashName: " AWP | Asiimov (Field-Tested) " }));

        expect(item.marketHashName).toBe("AWP | Asiimov (Field-Tested)");
    });

    it("Should reject a blank market name", () => {
        const create = () => CatalogItem.create(catalogItemPrimitives({ marketHashName: BLANK }));

        expect(create).toThrow(EmptyStringError);
    });

    it("Should reject a blank image url", () => {
        const create = () => CatalogItem.create(catalogItemPrimitives({ imageUrl: BLANK }));

        expect(create).toThrow(EmptyStringError);
    });

    it("Should not change once created", () => {
        const item = CatalogItem.create(catalogItemPrimitives());

        expect(Object.isFrozen(item)).toBe(true);
    });
});
