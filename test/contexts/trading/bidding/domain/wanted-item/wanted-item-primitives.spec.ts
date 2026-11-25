import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { maxForPercentage, maxForValue } from "./__builders__/max-for.builder";

const ACCOUNT_ID = 1;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const FIELD_TESTED = { type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED };
const MAX_VALUE = 19400;
const ADDED_AT = Date.parse("2026-11-20T14:03:00.000Z");

const ASIIMOV = {
    accountId: ACCOUNT_ID,
    name: ITEM_NAME,
    maxFor: maxForPercentage("-3"),
    criteria: [FIELD_TESTED],
    enabled: true,
    addedAt: ADDED_AT,
};

describe("Wanted Item primitives", () => {
    it("Should give back every primitive it holds", () => {
        const wantedItem = WantedItem.create(ASIIMOV);

        expect(wantedItem.toPrimitives()).toEqual(ASIIMOV);
    });

    it("Should give back that it is disabled", () => {
        const wantedItem = WantedItem.create(ASIIMOV);
        wantedItem.disable();

        expect(wantedItem.toPrimitives().enabled).toBe(false);
    });

    it("Should give back no criteria when it has none", () => {
        const wantedItem = WantedItem.create({ ...ASIIMOV, criteria: undefined });

        expect(wantedItem.toPrimitives().criteria).toEqual([]);
    });

    it("Should give back when it was added", () => {
        const wantedItem = WantedItem.create(ASIIMOV);

        expect(wantedItem.toPrimitives().addedAt).toBe(ADDED_AT);
    });

    it("Should be restored from its primitives", () => {
        const primitives = { ...ASIIMOV, maxFor: maxForValue(MAX_VALUE), enabled: false };

        const wantedItem = WantedItem.fromPrimitives(primitives);

        expect(wantedItem.toPrimitives()).toEqual(primitives);
    });
});
