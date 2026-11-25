import { ASCENDING, DESCENDING, SORT_ORDERS, type Sort, type SortOrder } from "@/packages/building-blocks/sort";

describe("Sort", () => {
    it("Should offer the two orders, lowest first and highest first", () => {
        expect(SORT_ORDERS).toEqual(["asc", "desc"]);
    });

    it("Should name the ascending and the descending orders", () => {
        expect([ASCENDING, DESCENDING]).toEqual(["asc", "desc"]);
    });

    it("Should type an order as asc or desc", () => {
        expectTypeOf<SortOrder>().toEqualTypeOf<"asc" | "desc">();
    });

    it("Should carry the field of its query and an order", () => {
        expectTypeOf<Sort<"name" | "size">>().toEqualTypeOf<{
            readonly field: "name" | "size";
            readonly order: "asc" | "desc";
        }>();
    });
});
