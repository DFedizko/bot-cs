import { buildWantedItem } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { Container } from "inversify";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { RemoveWantedItemCommand } from "@/contexts/trading/bidding/application/remove-wanted-item/remove-wanted-item.command";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { WantedItemNotFoundError } from "@/contexts/trading/bidding/domain/wanted-item/errors/wanted-item-not-found.error";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    REMOVE_WANTED_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "Foo Wanted Item";

const fooWantedItem = (accountId: number) =>
    buildWantedItem({ accountId, name: ITEM_NAME, maxFor: maxForPercentage("10") });

let container: Container;

describe("RemoveWantedItemCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should remove an wanted item", async () => {
        const wantedItemRepo = container.get(WANTED_ITEM_REPOSITORY);
        await wantedItemRepo.save(fooWantedItem(ACCOUNT_ID));

        await container
            .get(REMOVE_WANTED_ITEM_HANDLER)
            .handle(new RemoveWantedItemCommand({ accountId: ACCOUNT_ID, itemName: ITEM_NAME }));

        const wantedItem = await wantedItemRepo.findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem).toBe(undefined);
    });

    it("Should keep the same item wanted by another account", async () => {
        const wantedItemRepo = container.get(WANTED_ITEM_REPOSITORY);
        await wantedItemRepo.save(fooWantedItem(ACCOUNT_ID));
        await wantedItemRepo.save(fooWantedItem(OTHER_ACCOUNT_ID));

        await container
            .get(REMOVE_WANTED_ITEM_HANDLER)
            .handle(new RemoveWantedItemCommand({ accountId: ACCOUNT_ID, itemName: ITEM_NAME }));

        const wantedItem = await wantedItemRepo.findByName(new AccountId(OTHER_ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem).toBeDefined();
    });

    it("Should reject removing an item the account doesn't want", async () => {
        await container.get(WANTED_ITEM_REPOSITORY).save(fooWantedItem(OTHER_ACCOUNT_ID));

        const remove = container
            .get(REMOVE_WANTED_ITEM_HANDLER)
            .handle(new RemoveWantedItemCommand({ accountId: ACCOUNT_ID, itemName: ITEM_NAME }));

        await expect(remove).rejects.toThrow(WantedItemNotFoundError);
    });
});
