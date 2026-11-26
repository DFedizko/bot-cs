import { describe, expect, it } from "bun:test";
import { toCatalogSearchStatus } from "@/features/wanted-items/model/to-catalog-search-status";
import { catalogItemBuilder } from "../__builders__/catalog-item.builder";

const FOUND = [catalogItemBuilder()];

describe("toCatalogSearchStatus", () => {
    it("Should wait for enough text before searching", () => {
        expect(toCatalogSearchStatus({ query: null, searched: null, items: undefined, failed: false })).toBe("idle");
    });

    it("Should load while the searched text lags behind the typed one", () => {
        expect(toCatalogSearchStatus({ query: "awp", searched: "aw", items: FOUND, failed: false })).toBe("loading");
    });

    it("Should load until the results arrive", () => {
        expect(toCatalogSearchStatus({ query: "awp", searched: "awp", items: undefined, failed: false })).toBe(
            "loading",
        );
    });

    it("Should say when nothing matches", () => {
        expect(toCatalogSearchStatus({ query: "awp", searched: "awp", items: [], failed: false })).toBe("empty");
    });

    it("Should show the results", () => {
        expect(toCatalogSearchStatus({ query: "awp", searched: "awp", items: FOUND, failed: false })).toBe("results");
    });

    it("Should load a new search instead of showing the last one's failure", () => {
        expect(toCatalogSearchStatus({ query: "awp", searched: "aw", items: undefined, failed: true })).toBe("loading");
    });

    it("Should say when the search failed", () => {
        expect(toCatalogSearchStatus({ query: "awp", searched: "awp", items: undefined, failed: true })).toBe("error");
    });
});
