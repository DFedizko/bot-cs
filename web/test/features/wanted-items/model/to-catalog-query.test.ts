import { describe, expect, it } from "bun:test";
import { toCatalogQuery } from "@/features/wanted-items/model/to-catalog-query";

describe("toCatalogQuery", () => {
    it("Should search the text without its outer spaces", () => {
        expect(toCatalogQuery("  awp asii ")).toBe("awp asii");
    });

    it("Should not search fewer than two characters", () => {
        expect(toCatalogQuery(" a ")).toBeNull();
    });
});
