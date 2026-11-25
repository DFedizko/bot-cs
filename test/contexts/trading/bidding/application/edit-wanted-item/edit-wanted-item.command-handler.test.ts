import { buildWantedItem } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { Container } from "inversify";
import {
    maxForPercentage,
    maxForValue,
} from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { EditWantedItemCommand } from "@/contexts/trading/bidding/application/edit-wanted-item/edit-wanted-item.command";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { WantedItemNotFoundError } from "@/contexts/trading/bidding/domain/wanted-item/errors/wanted-item-not-found.error";
import { EmptyWantedItemChangesError } from "@/contexts/trading/bidding/domain/wanted-item/errors/empty-wanted-item-changes.error";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    EDIT_WANTED_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const WELL_WORN = { type: ItemCriterionType.IS_WEAR, value: WearName.WELL_WORN };

const asiimov = (accountId: number) =>
    buildWantedItem({
        accountId,
        name: ITEM_NAME,
        maxFor: maxForPercentage("-3"),
        criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
    });

const findAsiimov = (container: Container, accountId: number) =>
    container.get(WANTED_ITEM_REPOSITORY).findByName(new AccountId(accountId), new ItemName(ITEM_NAME));

let container: Container;

describe("EditWantedItemCommandHandler", () => {
    beforeEach(async () => {
        container = testContainer();
        await container.get(WANTED_ITEM_REPOSITORY).save(asiimov(ACCOUNT_ID));
    });

    it("Should change the max for of a wanted item", async () => {
        const command = new EditWantedItemCommand({
            accountId: ACCOUNT_ID,
            itemName: ITEM_NAME,
            maxFor: maxForPercentage("-5"),
        });

        await container.get(EDIT_WANTED_ITEM_HANDLER).handle(command);

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-5"));
    });

    it("Should switch a wanted item from a max percentage to a max value", async () => {
        const maxFor = maxForValue(19400);
        const command = new EditWantedItemCommand({ accountId: ACCOUNT_ID, itemName: ITEM_NAME, maxFor });

        await container.get(EDIT_WANTED_ITEM_HANDLER).handle(command);

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.getMaxFor()).toEqual(maxFor);
    });

    it("Should keep the old max for when the new max value is not above zero", async () => {
        const maxFor = maxForValue(-1);
        const command = new EditWantedItemCommand({ accountId: ACCOUNT_ID, itemName: ITEM_NAME, maxFor });

        await container
            .get(EDIT_WANTED_ITEM_HANDLER)
            .handle(command)
            .catch(() => {});

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-3"));
    });

    it("Should replace the criteria of a wanted item", async () => {
        const command = new EditWantedItemCommand({ accountId: ACCOUNT_ID, itemName: ITEM_NAME, criteria: [] });

        await container.get(EDIT_WANTED_ITEM_HANDLER).handle(command);

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.getCriteria()).toEqual([]);
    });

    it("Should keep the max for when only the criteria change", async () => {
        const command = new EditWantedItemCommand({
            accountId: ACCOUNT_ID,
            itemName: ITEM_NAME,
            criteria: [WELL_WORN],
        });

        await container.get(EDIT_WANTED_ITEM_HANDLER).handle(command);

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-3"));
    });

    it("Should never change the same item wanted by another account", async () => {
        await container.get(WANTED_ITEM_REPOSITORY).save(asiimov(OTHER_ACCOUNT_ID));
        const command = new EditWantedItemCommand({
            accountId: ACCOUNT_ID,
            itemName: ITEM_NAME,
            maxFor: maxForPercentage("-5"),
        });

        await container.get(EDIT_WANTED_ITEM_HANDLER).handle(command);

        const wantedItem = await findAsiimov(container, OTHER_ACCOUNT_ID);
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-3"));
    });

    it("Should reject editing an item the account doesn't want", async () => {
        const command = new EditWantedItemCommand({
            accountId: OTHER_ACCOUNT_ID,
            itemName: ITEM_NAME,
            maxFor: maxForPercentage("-5"),
        });

        const edit = container.get(EDIT_WANTED_ITEM_HANDLER).handle(command);

        await expect(edit).rejects.toThrow(WantedItemNotFoundError);
    });

    it("Should reject an edit with no changes", async () => {
        const command = new EditWantedItemCommand({ accountId: ACCOUNT_ID, itemName: ITEM_NAME });

        const edit = container.get(EDIT_WANTED_ITEM_HANDLER).handle(command);

        await expect(edit).rejects.toThrow(EmptyWantedItemChangesError);
    });

    it("Should be reached through the command bus", async () => {
        const command = new EditWantedItemCommand({
            accountId: ACCOUNT_ID,
            itemName: ITEM_NAME,
            maxFor: maxForPercentage("-5"),
        });

        await container.get(COMMAND_BUS).dispatch(command);

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-5"));
    });
});
