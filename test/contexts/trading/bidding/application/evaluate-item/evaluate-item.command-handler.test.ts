import { buildWantedItem } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { Container } from "inversify";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { evaluateItemCommand } from "./__mocks__/evaluate-item.command.mock";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { ItemApprovedOffAuctionEvent } from "@/contexts/trading/bidding/application/evaluate-item/item-approved-off-auction.event";
import { ItemApprovedInAuctionEvent } from "@/contexts/trading/bidding/application/evaluate-item/item-approved-in-auction.event";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    EVALUATE_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = evaluateItemCommand().accountId;
const OTHER_ACCOUNT_ID = ACCOUNT_ID + 1;
const ITEM_NAME = evaluateItemCommand().itemName;

const disabledCyberSecurity = (accountId: number) => {
    const wantedItem = buildWantedItem({ accountId, name: ITEM_NAME, maxFor: maxForPercentage("-4.05") });
    wantedItem.disable();
    return wantedItem;
};

let container: Container;

describe("EvaluateItemCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should evaluate and approve a item in auction when all criteria are met", async () => {
        const wantedItemRepo = container.get(WANTED_ITEM_REPOSITORY);
        await wantedItemRepo.save(
            buildWantedItem({
                accountId: ACCOUNT_ID,
                name: "M4A4 | Cyber Security (Field-Tested)",
                maxFor: maxForPercentage("-4.05"),
            }),
        );
        const wantedItemRepoSpy = jest.spyOn(wantedItemRepo, "findByName");
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");
        const command = evaluateItemCommand();

        await container.get(EVALUATE_ITEM_HANDLER).handle(command);

        const [[event]] = publishSpy.mock.calls[0] as [[ItemApprovedInAuctionEvent]];
        expect(wantedItemRepoSpy).toHaveBeenCalledWith(
            new AccountId(ACCOUNT_ID),
            new ItemName("M4A4 | Cyber Security (Field-Tested)"),
        );
        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(event.payload.auctionId).toBe(288767047);
        expect(event.payload.accountId).toBe(command.accountId);
        expect(event.name).toBe(ItemApprovedInAuctionEvent.EVENT_NAME);
        expect(event.payload.value).toBe(command.price);
        expect(event.payload.maxPrice).toBe(3647);
    });
    it("Should evaluate and approve a item out of the auction when all criteria are met", async () => {
        const wantedItemRepo = container.get(WANTED_ITEM_REPOSITORY);
        await wantedItemRepo.save(
            buildWantedItem({
                accountId: ACCOUNT_ID,
                name: "M4A4 | Cyber Security (Field-Tested)",
                maxFor: maxForPercentage("-4.05"),
            }),
        );
        const wantedItemRepoSpy = jest.spyOn(wantedItemRepo, "findByName");
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");
        const command = evaluateItemCommand(false);

        await container.get(EVALUATE_ITEM_HANDLER).handle(command);

        const [[event]] = publishSpy.mock.calls[0] as [[ItemApprovedOffAuctionEvent]];
        expect(wantedItemRepoSpy).toHaveBeenCalledWith(
            new AccountId(ACCOUNT_ID),
            new ItemName("M4A4 | Cyber Security (Field-Tested)"),
        );
        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(event.name).toBe(ItemApprovedOffAuctionEvent.EVENT_NAME);
        expect(event.payload.itemId).toBe(288767047);
        expect(event.payload.accountId).toBe(command.accountId);
        expect(event.payload.value).toBe(command.price);
    });
    it("Should evaluate reject a item when certain criteria aren't met", async () => {
        const criterion = { type: ItemCriterionType.IS_WEAR, value: WearName.BATTLE_SCARRED };
        const wantedItemRepo = container.get(WANTED_ITEM_REPOSITORY);
        await wantedItemRepo.save(
            buildWantedItem({
                accountId: ACCOUNT_ID,
                name: "M4A4 | Cyber Security (Field-Tested)",
                maxFor: maxForPercentage("-4.06"),
                criteria: [criterion],
            }),
        );
        const wantedItemRepoSpy = jest.spyOn(wantedItemRepo, "findByName");
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(EVALUATE_ITEM_HANDLER).handle(evaluateItemCommand());

        expect(wantedItemRepoSpy).toHaveBeenCalledWith(
            new AccountId(ACCOUNT_ID),
            new ItemName("M4A4 | Cyber Security (Field-Tested)"),
        );
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(`AboveRecommendedPercentage(-4.06%); IsWear(Battle-Scarred)`);
        expect(publishSpy).not.toHaveBeenCalled();
    });
    it("Should ignore the same item wanted by another account", async () => {
        await container.get(WANTED_ITEM_REPOSITORY).save(
            buildWantedItem({
                accountId: OTHER_ACCOUNT_ID,
                name: "M4A4 | Cyber Security (Field-Tested)",
                maxFor: maxForPercentage("-4.05"),
            }),
        );
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(EVALUATE_ITEM_HANDLER).handle(evaluateItemCommand());

        expect(publishSpy).not.toHaveBeenCalled();
    });
    describe("With a disabled wanted item", () => {
        it("Should skip it without publishing any event", async () => {
            await container.get(WANTED_ITEM_REPOSITORY).save(disabledCyberSecurity(ACCOUNT_ID));
            jest.spyOn(container.get(LOGGER), "debug").mockImplementation(() => {});
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await container.get(EVALUATE_ITEM_HANDLER).handle(evaluateItemCommand());

            expect(publishSpy).not.toHaveBeenCalled();
        });
        it("Should log the skip at debug level", async () => {
            await container.get(WANTED_ITEM_REPOSITORY).save(disabledCyberSecurity(ACCOUNT_ID));
            const debugSpy = jest.spyOn(container.get(LOGGER), "debug").mockImplementation(() => {});

            await container.get(EVALUATE_ITEM_HANDLER).handle(evaluateItemCommand());

            expect(debugSpy).toHaveBeenCalledWith(
                `Skipped "${ITEM_NAME}" for account ${ACCOUNT_ID}: ${WantedItem.DISABLED_FAILURE}`,
            );
        });
        it("Should still approve the same item wanted by another account", async () => {
            const repository = container.get(WANTED_ITEM_REPOSITORY);
            await repository.save(disabledCyberSecurity(OTHER_ACCOUNT_ID));
            jest.spyOn(container.get(LOGGER), "debug").mockImplementation(() => {});
            await repository.save(
                buildWantedItem({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: maxForPercentage("-4.05") }),
            );
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await container.get(EVALUATE_ITEM_HANDLER).handle(evaluateItemCommand());

            expect(publishSpy).toHaveBeenCalledWith([expect.any(ItemApprovedInAuctionEvent)]);
        });
    });
});
