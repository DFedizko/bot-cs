import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";

describe("Wanted Item", () => {
    it("Should create a wanted item", () => {
        const wantedItem = WantedItem.create({
            name: "AWP | Asiimov (Field-Tested)",
            maxFor: "-3",
            criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
        });
        expect(wantedItem.getName()).toBe("AWP | Asiimov (Field-Tested)");
        expect(wantedItem.getCriteria()).toEqual(["IsWear"]);
    });
    describe("Should evaluate an item and approve", () => {
        it("With negative above recommended percentage", () => {
            const wantedItem = WantedItem.create({
                name: "AWP | Asiimov (Field-Tested)",
                maxFor: "-3",
            });
            expect(
                wantedItem.evaluate({ value: 19400, referencePrice: 20000, aboveRecommendedPercentage: "-3" }),
            ).toMatchObject({
                approved: true,
                maxPrice: 19400,
                failures: [],
            });
        });
        it("With negative above recommended percentage and a criterion", () => {
            const wantedItem = WantedItem.create({
                name: "AWP | Asiimov (Field-Tested)",
                maxFor: "-3",
                criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
            });
            expect(
                wantedItem.evaluate({
                    value: 19400,
                    referencePrice: 20000,
                    aboveRecommendedPercentage: "-3",
                    wearName: WearName.FIELD_TESTED,
                }),
            ).toMatchObject({
                approved: true,
                maxPrice: 19400,
                failures: [],
            });
        });
        it("With positive above recommended percentage", () => {
            const wantedItem = WantedItem.create({
                name: "AWP | Asiimov (Field-Tested)",
                maxFor: "3",
            });
            expect(
                wantedItem.evaluate({ value: 20000, referencePrice: 20000, aboveRecommendedPercentage: "0" }),
            ).toMatchObject({
                approved: true,
                maxPrice: 20600,
                failures: [],
            });
        });
    });
    describe("Should evaluate an item and reject", () => {
        it("With a value above recommended recommended percentage", () => {
            const wantedItem = WantedItem.create({
                name: "AWP | Asiimov (Field-Tested)",
                maxFor: "-3",
            });
            expect(
                wantedItem.evaluate({ value: 19600, referencePrice: 20000, aboveRecommendedPercentage: "-2" }),
            ).toMatchObject({
                approved: false,
                maxPrice: 19400,
                failures: ["AboveRecommendedPercentage(-3%)"],
            });
        });
        it("With a value above recommended recommended percentage and without met a criterion", () => {
            const wantedItem = WantedItem.create({
                name: "AWP | Asiimov (Field-Tested)",
                maxFor: "-3",
                criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
            });
            expect(
                wantedItem.evaluate({
                    value: 19600,
                    referencePrice: 20000,
                    aboveRecommendedPercentage: "-2.99",
                    wearName: WearName.WELL_WORN,
                }),
            ).toMatchObject({
                approved: false,
                maxPrice: 19400,
                failures: ["AboveRecommendedPercentage(-3%)", "IsWear(Field-Tested)"],
            });
        });
    });
});
