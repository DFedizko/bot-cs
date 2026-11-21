import type { Container } from "inversify";
import { ToggleWantedItemCommand } from "@/contexts/trading/bidding/application/toggle-wanted-item/toggle-wanted-item.command";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { WantedItemNotFoundError } from "@/contexts/trading/bidding/domain/wanted-item/errors/wanted-item-not-found.error";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    TOGGLE_WANTED_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";

const asiimov = (accountId: number) => WantedItem.create({ accountId, name: ITEM_NAME, maxFor: "-3" });

const toggle = (enabled: boolean, accountId = ACCOUNT_ID) =>
    new ToggleWantedItemCommand({ accountId, itemName: ITEM_NAME, enabled });

const findAsiimov = (container: Container, accountId: number) =>
    container.get(WANTED_ITEM_REPOSITORY).findByName(new AccountId(accountId), new ItemName(ITEM_NAME));

let container: Container;

describe("ToggleWantedItemCommandHandler", () => {
    beforeEach(async () => {
        container = testContainer();
        await container.get(WANTED_ITEM_REPOSITORY).save(asiimov(ACCOUNT_ID));
    });

    it("Should disable a wanted item", async () => {
        await container.get(TOGGLE_WANTED_ITEM_HANDLER).handle(toggle(false));

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.isEnabled()).toBe(false);
    });

    it("Should enable a disabled wanted item", async () => {
        await container.get(TOGGLE_WANTED_ITEM_HANDLER).handle(toggle(false));

        await container.get(TOGGLE_WANTED_ITEM_HANDLER).handle(toggle(true));

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.isEnabled()).toBe(true);
    });

    it("Should keep a wanted item disabled when asked to disable it twice", async () => {
        await container.get(TOGGLE_WANTED_ITEM_HANDLER).handle(toggle(false));

        await container.get(TOGGLE_WANTED_ITEM_HANDLER).handle(toggle(false));

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.isEnabled()).toBe(false);
    });

    it("Should save the switched wanted item", async () => {
        const saveSpy = jest.spyOn(container.get(WANTED_ITEM_REPOSITORY), "save");

        await container.get(TOGGLE_WANTED_ITEM_HANDLER).handle(toggle(false));

        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    });

    it("Should never disable the same item wanted by another account", async () => {
        await container.get(WANTED_ITEM_REPOSITORY).save(asiimov(OTHER_ACCOUNT_ID));

        await container.get(TOGGLE_WANTED_ITEM_HANDLER).handle(toggle(false));

        const wantedItem = await findAsiimov(container, OTHER_ACCOUNT_ID);
        expect(wantedItem?.isEnabled()).toBe(true);
    });

    it("Should reject switching an item the account doesn't want", async () => {
        const switching = container.get(TOGGLE_WANTED_ITEM_HANDLER).handle(toggle(false, OTHER_ACCOUNT_ID));

        await expect(switching).rejects.toThrow(WantedItemNotFoundError);
    });

    it("Should be reached through the command bus", async () => {
        await container.get(COMMAND_BUS).dispatch(toggle(false));

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.isEnabled()).toBe(false);
    });
});
