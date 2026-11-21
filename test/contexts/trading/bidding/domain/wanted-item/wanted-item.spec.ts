import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { EmptyWantedItemChangesError } from "@/contexts/trading/bidding/domain/wanted-item/errors/empty-wanted-item-changes.error";
import { DomainError } from "@/packages/error/domain-error";

const ACCOUNT_ID = 1;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const FIELD_TESTED = { type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED };
const WELL_WORN = { type: ItemCriterionType.IS_WEAR, value: WearName.WELL_WORN };

const asiimov = () =>
    WantedItem.create({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: "-3", criteria: [FIELD_TESTED] });

describe("Wanted Item", () => {
    it("Should create a wanted item", () => {
        const wantedItem = WantedItem.create({
            accountId: ACCOUNT_ID,
            name: "AWP | Asiimov (Field-Tested)",
            maxFor: "-3",
            criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
        });
        expect(wantedItem.getName()).toBe("AWP | Asiimov (Field-Tested)");
        expect(wantedItem.getMaxFor()).toBe("-3");
        expect(wantedItem.getCriteria()).toEqual(["IsWear"]);
    });
    it("Should belong to the account that wants it", () => {
        const wantedItem = asiimov();

        expect(wantedItem.getAccountId()).toBe(ACCOUNT_ID);
    });
    it("Should reject an invalid account", () => {
        const create = () => WantedItem.create({ accountId: -1, name: ITEM_NAME, maxFor: "-3" });

        expect(create).toThrow(DomainError);
    });
    describe("Should be edited", () => {
        it("With a new max for", () => {
            const wantedItem = asiimov();

            wantedItem.edit({ maxFor: "-5" });

            expect(wantedItem.getMaxFor()).toBe("-5");
        });
        it("With new criteria replacing the old ones", () => {
            const wantedItem = asiimov();

            wantedItem.edit({ criteria: [] });

            expect(wantedItem.getCriteria()).toEqual([]);
        });
        it("Keeping the max for when only the criteria change", () => {
            const wantedItem = asiimov();

            wantedItem.edit({ criteria: [WELL_WORN] });

            expect(wantedItem.getMaxFor()).toBe("-3");
        });
        it("Evaluating with the replaced criteria", () => {
            const wantedItem = asiimov();

            wantedItem.edit({ criteria: [WELL_WORN] });

            const decision = wantedItem.evaluate({
                value: 19400,
                referencePrice: 20000,
                aboveRecommendedPercentage: "-3",
                wearName: WearName.WELL_WORN,
            });
            expect(decision.approved).toBe(true);
        });
    });
    describe("Should reject an edit", () => {
        it("With no changes", () => {
            const wantedItem = asiimov();

            const edit = () => wantedItem.edit({});

            expect(edit).toThrow(EmptyWantedItemChangesError);
        });
        it("With an invalid max for", () => {
            const wantedItem = asiimov();

            const edit = () => wantedItem.edit({ maxFor: "a lot" });

            expect(edit).toThrow(DomainError);
        });
        it("Without changing anything when one of the changes is invalid", () => {
            const wantedItem = asiimov();

            const edit = () => wantedItem.edit({ maxFor: "-5", criteria: [{ ...WELL_WORN, value: "Brand New" }] });

            expect(edit).toThrow(DomainError);
            expect(wantedItem.getMaxFor()).toBe("-3");
        });
    });
    describe("Should evaluate an item and approve", () => {
        it("With negative above recommended percentage", () => {
            const wantedItem = WantedItem.create({
                accountId: ACCOUNT_ID,
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
                accountId: ACCOUNT_ID,
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
                accountId: ACCOUNT_ID,
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
                accountId: ACCOUNT_ID,
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
                accountId: ACCOUNT_ID,
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
