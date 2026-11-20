import { evaluateItemCommand } from "./__mocks__/evaluate-item.command.mock";
import type { Mock } from "bun:test";
import { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Logger } from "@/packages/application/logger";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { WantedItemRepository } from "@/contexts/trading/bidding/application/wanted-item.repository";
import { EvaluateItemCommand } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command";
import type { EventBus } from "@/packages/application/event-bus";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    EVALUATE_ITEM_HANDLER,
    WANTED_ITEM_REPOSITORY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { ItemApprovedOffAuctionEvent } from "@/contexts/trading/bidding/application/evaluate-item/item-approved-off-auction.event";
import { ItemApprovedInAuctionEvent } from "@/contexts/trading/bidding/application/evaluate-item/item-approved-in-auction.event";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";

let wantedItemRepo: WantedItemRepository;
let wantedItemRepoSpy: Mock<WantedItemRepository["findByName"]>;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let eventBus: EventBus;
let publishSpy: Mock<EventBus["publish"]>;
let evaluateItem: CommandHandler<EvaluateItemCommand>;
const fakeWantedItems: WantedItem[] = [];
describe("EvaluateItemCommandHandler", () => {
    beforeEach(() => {
        const container = testContainer();
        wantedItemRepo = container.get(WANTED_ITEM_REPOSITORY);
        wantedItemRepoSpy = jest.spyOn(wantedItemRepo, "findByName");
        logger = container.get(LOGGER);
        loggerSpy = jest.spyOn(logger, "log");
        eventBus = container.get(EVENT_BUS);
        publishSpy = jest.spyOn(eventBus, "publish");
        evaluateItem = container.get(EVALUATE_ITEM_HANDLER);
    });

    afterEach(() => (fakeWantedItems.length = 0));

    it("Should evaluate and approve a item in auction when all criteria are met", async () => {
        await wantedItemRepo.save(
            WantedItem.create({
                name: "M4A4 | Cyber Security (Field-Tested)",
                maxFor: "-4.05",
            }),
        );
        const command = evaluateItemCommand();
        await evaluateItem.handle(command);
        const [[event]] = publishSpy.mock.calls[0] as [[ItemApprovedInAuctionEvent]];
        expect(wantedItemRepoSpy).toHaveBeenCalledWith(new ItemName("M4A4 | Cyber Security (Field-Tested)"));
        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(event.payload.auctionId).toBe(288767047);
        expect(event.payload.accountId).toBe(command.accountId);
        expect(event.name).toBe(ItemApprovedInAuctionEvent.EVENT_NAME);
        expect(event.payload.value).toBe(command.price);
        expect(event.payload.maxPrice).toBe(3647);
    });
    it("Should evaluate and approve a item out of the auction when all criteria are met", async () => {
        await wantedItemRepo.save(
            WantedItem.create({
                name: "M4A4 | Cyber Security (Field-Tested)",
                maxFor: "-4.05",
            }),
        );
        const command = evaluateItemCommand(false);
        await evaluateItem.handle(command);
        const [[event]] = publishSpy.mock.calls[0] as [[ItemApprovedOffAuctionEvent]];
        expect(wantedItemRepoSpy).toHaveBeenCalledWith(new ItemName("M4A4 | Cyber Security (Field-Tested)"));
        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(event.name).toBe(ItemApprovedOffAuctionEvent.EVENT_NAME);
        expect(event.payload.itemId).toBe(288767047);
        expect(event.payload.accountId).toBe(command.accountId);
        expect(event.payload.value).toBe(command.price);
    });
    it("Should evaluate reject a item when certain criteria aren't met", async () => {
        const criterion = { type: ItemCriterionType.IS_WEAR, value: WearName.BATTLE_SCARRED };
        await wantedItemRepo.save(
            WantedItem.create({
                name: "M4A4 | Cyber Security (Field-Tested)",
                maxFor: "-4.06",
                criteria: [criterion],
            }),
        );
        await evaluateItem.handle(evaluateItemCommand());
        expect(wantedItemRepoSpy).toHaveBeenCalledWith(new ItemName("M4A4 | Cyber Security (Field-Tested)"));
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(`AboveRecommendedPercentage(-4.06%); IsWear(Battle-Scarred)`);
        expect(publishSpy).not.toHaveBeenCalled();
    });
});
