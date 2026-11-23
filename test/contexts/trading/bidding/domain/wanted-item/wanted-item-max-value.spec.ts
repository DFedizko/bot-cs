import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { DomainError } from "@/packages/error/domain-error";
import { maxForPercentage, maxForValue } from "./__builders__/max-for.builder";

const ACCOUNT_ID = 1;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const FIELD_TESTED = { type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED };

const MATCHING_CANDIDATE = {
    value: 19400,
    referencePrice: 20000,
    aboveRecommendedPercentage: "-3",
    wearName: WearName.FIELD_TESTED,
};

const asiimov = () => WantedItem.create({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: maxForPercentage("-3") });

describe("Wanted Item with a max value", () => {
    describe("Should evaluate an item against a max value", () => {
        const asiimovUpTo = (cents: number) =>
            WantedItem.create({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: maxForValue(cents) });

        it("Approving a candidate worth exactly the max value", () => {
            const decision = asiimovUpTo(19400).evaluate({ ...MATCHING_CANDIDATE, value: 19400 });

            expect(decision).toMatchObject({ approved: true, maxPrice: 19400, failures: [] });
        });
        it("Keeping the max value as max price whatever the reference price", () => {
            const decision = asiimovUpTo(19400).evaluate({ ...MATCHING_CANDIDATE, referencePrice: 50000 });

            expect(decision.maxPrice).toBe(19400);
        });
        it("Rejecting a candidate worth one cent above the max value", () => {
            const decision = asiimovUpTo(19400).evaluate({ ...MATCHING_CANDIDATE, value: 19401 });

            expect(decision).toMatchObject({ approved: false, maxPrice: 19400, failures: ["AboveMaxValue(19400)"] });
        });
        it("Ignoring the percentage above the recommended price", () => {
            const decision = asiimovUpTo(30000).evaluate({ ...MATCHING_CANDIDATE, aboveRecommendedPercentage: "40" });

            expect(decision.approved).toBe(true);
        });
        it("Rejecting a max value and a criterion together", () => {
            const wantedItem = WantedItem.create({
                accountId: ACCOUNT_ID,
                name: ITEM_NAME,
                maxFor: maxForValue(19400),
                criteria: [FIELD_TESTED],
            });

            const decision = wantedItem.evaluate({ ...MATCHING_CANDIDATE, value: 19600, wearName: WearName.WELL_WORN });

            expect(decision.failures).toEqual(["AboveMaxValue(19400)", "IsWear(Field-Tested)"]);
        });
    });
    describe("Should switch its kind of max for", () => {
        it("From a percentage to a value", () => {
            const wantedItem = asiimov();

            wantedItem.edit({ maxFor: maxForValue(19400) });

            expect(wantedItem.getMaxFor()).toEqual(maxForValue(19400));
        });
        it("From a value to a percentage", () => {
            const wantedItem = WantedItem.create({
                accountId: ACCOUNT_ID,
                name: ITEM_NAME,
                maxFor: maxForValue(19400),
            });

            wantedItem.edit({ maxFor: maxForPercentage("-5") });

            expect(wantedItem.getMaxFor()).toEqual(maxForPercentage("-5"));
        });
        it("Changing the value within the same kind", () => {
            const wantedItem = WantedItem.create({
                accountId: ACCOUNT_ID,
                name: ITEM_NAME,
                maxFor: maxForValue(19400),
            });

            wantedItem.edit({ maxFor: maxForValue(18000) });

            expect(wantedItem.getMaxFor()).toEqual(maxForValue(18000));
        });
        it("Evaluating with the new kind", () => {
            const wantedItem = asiimov();

            wantedItem.edit({ maxFor: maxForValue(30000) });

            const decision = wantedItem.evaluate({
                ...MATCHING_CANDIDATE,
                value: 29000,
                aboveRecommendedPercentage: "45",
            });
            expect(decision).toMatchObject({ approved: true, maxPrice: 30000 });
        });
    });
    describe("Should reject a max value", () => {
        it.each([[0], [-1]])("Of %p coin cents when created", (cents) => {
            const create = () =>
                WantedItem.create({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: maxForValue(cents) });

            expect(create).toThrow(DomainError);
        });
        it("Of zero coin cents when edited, keeping the old max for", () => {
            const wantedItem = asiimov();

            const edit = () => wantedItem.edit({ maxFor: maxForValue(0) });

            expect(edit).toThrow(DomainError);
            expect(wantedItem.getMaxFor()).toEqual(maxForPercentage("-3"));
        });
    });
});
