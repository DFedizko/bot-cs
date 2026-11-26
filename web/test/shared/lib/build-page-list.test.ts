import { describe, expect, it } from "bun:test";
import { buildPageList } from "@/shared/lib/build-page-list";

describe("buildPageList", () => {
    it("Should list every page when there are few", () => {
        expect(buildPageList(2, 3)).toEqual([1, 2, 3]);
    });

    it("Should hide the far pages behind gaps", () => {
        expect(buildPageList(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
    });

    it("Should keep the pages near the start together", () => {
        expect(buildPageList(2, 12)).toEqual([1, 2, 3, 4, 5, "gap", 12]);
    });

    it("Should keep the pages near the end together", () => {
        expect(buildPageList(11, 12)).toEqual([1, "gap", 8, 9, 10, 11, 12]);
    });
});
