import type { Container } from "inversify";
import {
    maxForPercentage,
    maxForValue,
} from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { AddWantedItemCommand } from "@/contexts/trading/bidding/application/add-wanted-item/add-wanted-item.command";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { WantedItemAlreadyExistsError } from "@/contexts/trading/bidding/domain/wanted-item/errors/wanted-item-already-exists.error";
import { NonPositiveMaxValueError } from "@/contexts/trading/bidding/domain/wanted-item/errors/non-positive-max-value.error";
import { CLOCK, COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { ADDED_AT } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    ADD_WANTED_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";

const addAsiimov = (accountId = ACCOUNT_ID, maxFor = maxForPercentage("-3")) =>
    new AddWantedItemCommand({
        accountId,
        itemName: ITEM_NAME,
        maxFor,
        criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
    });

let container: Container;

describe("AddWantedItemCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should create and add wanted items", async () => {
        const command = addAsiimov();

        await container.get(ADD_WANTED_ITEM_HANDLER).handle(command);

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getId()).toBe(command.itemName);
        expect(wantedItem?.getName()).toBe(command.itemName);
        expect(wantedItem?.getAccountId()).toBe(command.accountId);
        expect(wantedItem?.getMaxFor()).toEqual(command.maxFor);
        expect(wantedItem?.getCriteria()).toEqual(["IsWear"]);
    });

    it("Should record when the item was added, as the clock reads it", async () => {
        jest.spyOn(container.get(CLOCK), "now").mockReturnValue(ADDED_AT);

        await container.get(ADD_WANTED_ITEM_HANDLER).handle(addAsiimov());

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.toPrimitives().addedAt).toBe(ADDED_AT);
    });

    it("Should add a wanted item with a max value", async () => {
        const command = addAsiimov(ACCOUNT_ID, maxForValue(19400));

        await container.get(ADD_WANTED_ITEM_HANDLER).handle(command);

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toEqual(maxForValue(19400));
    });

    it("Should reject a max value that is not above zero", async () => {
        const add = container.get(ADD_WANTED_ITEM_HANDLER).handle(addAsiimov(ACCOUNT_ID, maxForValue(0)));

        await expect(add).rejects.toThrow(NonPositiveMaxValueError);
    });

    it("Should reject an item the account already wants", async () => {
        const handler = container.get(ADD_WANTED_ITEM_HANDLER);
        await handler.handle(addAsiimov());

        const addAgain = handler.handle(addAsiimov(ACCOUNT_ID, maxForPercentage("5")));

        await expect(addAgain).rejects.toThrow(WantedItemAlreadyExistsError);
    });

    it("Should keep the existing item when adding it again", async () => {
        const handler = container.get(ADD_WANTED_ITEM_HANDLER);
        await handler.handle(addAsiimov());

        await handler.handle(addAsiimov(ACCOUNT_ID, maxForPercentage("5"))).catch(() => {});

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-3"));
    });

    it("Should let another account want the same item with its own settings", async () => {
        const handler = container.get(ADD_WANTED_ITEM_HANDLER);
        await handler.handle(addAsiimov());

        await handler.handle(addAsiimov(OTHER_ACCOUNT_ID, maxForPercentage("5")));

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(OTHER_ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("5"));
    });

    it("Should be reached through the command bus", async () => {
        const commandBus = container.get(COMMAND_BUS);

        await commandBus.dispatch(addAsiimov());

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem).toBeDefined();
    });
});
