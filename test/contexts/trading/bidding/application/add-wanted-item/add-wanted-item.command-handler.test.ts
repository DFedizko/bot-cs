import type { Container } from "inversify";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { AddWantedItemCommand } from "@/contexts/trading/bidding/application/add-wanted-item/add-wanted-item.command";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { WantedItemAlreadyExistsError } from "@/contexts/trading/bidding/domain/wanted-item/errors/wanted-item-already-exists.error";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    ADD_WANTED_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";

const addAsiimov = (accountId = ACCOUNT_ID, maxFor = "-3") =>
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
        expect(wantedItem?.getMaxFor()).toBe(command.maxFor);
        expect(wantedItem?.getCriteria()).toEqual(["IsWear"]);
    });

    it("Should reject an item the account already wants", async () => {
        const handler = container.get(ADD_WANTED_ITEM_HANDLER);
        await handler.handle(addAsiimov());

        const addAgain = handler.handle(addAsiimov(ACCOUNT_ID, "5"));

        await expect(addAgain).rejects.toThrow(WantedItemAlreadyExistsError);
    });

    it("Should keep the existing item when adding it again", async () => {
        const handler = container.get(ADD_WANTED_ITEM_HANDLER);
        await handler.handle(addAsiimov());

        await handler.handle(addAsiimov(ACCOUNT_ID, "5")).catch(() => {});

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toBe("-3");
    });

    it("Should let another account want the same item with its own settings", async () => {
        const handler = container.get(ADD_WANTED_ITEM_HANDLER);
        await handler.handle(addAsiimov());

        await handler.handle(addAsiimov(OTHER_ACCOUNT_ID, "5"));

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(OTHER_ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toBe("5");
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
