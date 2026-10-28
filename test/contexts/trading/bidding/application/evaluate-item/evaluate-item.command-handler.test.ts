import { EvaluateItemCommandHandler } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command-handler";
import { evaluateItemCommand } from "./__mocks__/evaluate-item.command.mock";
import type { Mock } from "bun:test";
import { MaxAboveRecommendedPercentage } from "@/contexts/trading/bidding/domain/wanted-skin/criteria/max-above-recommended-percentage";
import { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Logger } from "@/packages/application/logger";
import { WantedSkin } from "@/contexts/trading/bidding/domain/wanted-skin/wanted-skin";
import { WantedSkinRepository } from "@/contexts/trading/bidding/application/repositories/wanted-skin.repository";
import { EvaluateItemCommand } from "@/contexts/trading/bidding/application/evaluate-item/evaluate-item.command";
import { EventBusInMemoryAsync } from "@/packages/external/event-bus/event-bus.in-memory-async";
import type { EventBus } from "@/packages/application/event-bus";
import { BidIncrementer } from "@/contexts/trading/bidding/domain/auction/bid-incrementer";
import { ItemEvaluatedEvent } from "@/contexts/trading/bidding/application/events/item-evaluated.event";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";

let wantedSkinRepo: WantedSkinRepository;
let wantedSkinRepoSpy: Mock<WantedSkinRepository["findByName"]>;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let eventBus: EventBus;
let publishSpy: Mock<EventBus["publish"]>;
let evaluateItem: CommandHandler<EvaluateItemCommand>;
const fakeWantedSkins: WantedSkin[] = [];
describe("EvaluateItemCommandHandler", () => {
    beforeEach(() => {
        wantedSkinRepo = {
            save: async (wantedSkin: WantedSkin) => {
                fakeWantedSkins.push(wantedSkin);
            },
            findByName: async (name) => fakeWantedSkins.find((wanted) => wanted.getName() === name),
        };
        wantedSkinRepoSpy = jest.spyOn(wantedSkinRepo, "findByName");
        logger = new LoggerConsoleAdapter();
        loggerSpy = jest.spyOn(logger, "log");
        eventBus = new EventBusInMemoryAsync();
        publishSpy = jest.spyOn(eventBus, "publish");
        evaluateItem = new EvaluateItemCommandHandler(wantedSkinRepo, logger, eventBus);
    });

    afterEach(() => (fakeWantedSkins.length = 0));

    it("Should evaluate and decide whether to place a bid on an item when all criteria are met", async () => {
        await wantedSkinRepo.save(
            WantedSkin.create({
                name: "M4A4 | Cyber Security (Field-Tested)",
                criteria: [new MaxAboveRecommendedPercentage("-4.05")],
            }),
        );
        const command = evaluateItemCommand();
        await evaluateItem.handle(command);
        const [[event]] = publishSpy.mock.calls[0] as [[ItemEvaluatedEvent]];
        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(event.name).toBe(ItemEvaluatedEvent.EVENT_NAME);
        expect(event.payload.auctionId).toBe(288767047);
        expect(event.payload.value).toBe(
            BidIncrementer.nextFor({ value: command.price, numberOfBids: command.numberOfBids }),
        );
    });
    it("Should evaluate and decide not to place a bid on an item when certain criteria aren't met", async () => {
        const criterion = new MaxAboveRecommendedPercentage("-4.06");
        await wantedSkinRepo.save(
            WantedSkin.create({
                name: "M4A4 | Cyber Security (Field-Tested)",
                criteria: [criterion],
            }),
        );
        await evaluateItem.handle(evaluateItemCommand());
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(criterion.describe());
        expect(publishSpy).not.toHaveBeenCalled();
    });
    it("Should don't make anything when skin isn't in auction", async () => {
        await evaluateItem.handle(evaluateItemCommand(false));
        expect(loggerSpy).toHaveBeenCalledTimes(0);
        expect(wantedSkinRepoSpy).not.toHaveBeenCalled();
    });
});
