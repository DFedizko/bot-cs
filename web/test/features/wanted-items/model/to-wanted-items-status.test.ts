import { describe, expect, it } from "bun:test";
import { toWantedItemsStatus } from "@/features/wanted-items/model/to-wanted-items-status";

const COUNTS = { all: 47, enabled: 41, disabled: 6 };

describe("toWantedItemsStatus", () => {
    it("Should fail when the query failed", () => {
        expect(toWantedItemsStatus({ isPending: false, isError: true, counts: undefined })).toBe("error");
    });

    it("Should load until the counts are known", () => {
        expect(toWantedItemsStatus({ isPending: true, isError: false, counts: undefined })).toBe("loading");
    });

    it("Should be empty when the account wants nothing", () => {
        expect(toWantedItemsStatus({ isPending: false, isError: false, counts: { ...COUNTS, all: 0 } })).toBe("empty");
    });

    it("Should be ready with items", () => {
        expect(toWantedItemsStatus({ isPending: false, isError: false, counts: COUNTS })).toBe("ready");
    });
});
