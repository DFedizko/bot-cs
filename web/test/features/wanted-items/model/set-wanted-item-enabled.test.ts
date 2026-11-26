import { describe, expect, it } from "bun:test";
import { setWantedItemEnabled } from "@/features/wanted-items/model/set-wanted-item-enabled";
import type { WantedItemsPage } from "@/features/wanted-items/model/wanted-items-page";
import { wantedItemBuilder } from "../__builders__/wanted-item.builder";

const ITEM = wantedItemBuilder();
const OTHER = wantedItemBuilder({ name: "AK-47 | Redline (Field-Tested)" });
const PAGE: WantedItemsPage = {
    items: [ITEM, OTHER],
    page: 1,
    pageSize: 18,
    total: 2,
    counts: { all: 2, enabled: 2, disabled: 0 },
};

describe("setWantedItemEnabled", () => {
    it("Should pause the item and count it as paused", () => {
        const page = setWantedItemEnabled(PAGE, ITEM.name, false);

        expect(page).toMatchObject({
            items: [{ ...ITEM, enabled: false }, OTHER],
            counts: { all: 2, enabled: 1, disabled: 1 },
        });
    });

    it("Should leave the page as it is when the item already has that state", () => {
        expect(setWantedItemEnabled(PAGE, ITEM.name, true)).toEqual(PAGE);
    });
});
