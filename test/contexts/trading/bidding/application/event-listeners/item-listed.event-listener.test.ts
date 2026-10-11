import { ItemListedEventListener } from "@/contexts/trading/bidding/application/event-listeners/item-listed.event-listener";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/commands/place-bid.command";
import type { ItemListedEvent } from "@/contexts/trading/bidding/application/events/item-listed.event";
import type { EventListener } from "@/shared/application/event-listener";
import { CommandBusInMemory } from "@/shared/external/command-bus/command-bus.in-memory";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import { CommandHandlers } from "@/shared/infrastructure/command-bus/command-handlers";
import { itemListedEvent } from "./__mocks__/item-listed.event.mock";
import type { Mock } from "bun:test";
import { MaxAboveRecommendedPercentage } from "@/contexts/trading/bidding/domain/specifications/max-above-recommended-percentage";
import type {
    DesiredItem,
    DesiredItemRepository,
} from "@/contexts/trading/bidding/application/repositories/desired-item.repository";
import { CommandHandler } from "@/shared/building-blocks/command-handler";
import type { Logger } from "@/shared/application/logger";

let commandHandler: CommandHandler<PlaceBidCommand>;
let commandHandlers: CommandHandlers;
let desiredItemsRepo: DesiredItemRepository;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let commandBus: CommandBus;
let dispatchCommandSpy: Mock<CommandBus["dispatch"]>;
let itemListed: EventListener<ItemListedEvent>;
const fakeDesiredItems: DesiredItem[] = [];
describe("ItemListedEventListener", () => {
    beforeEach(() => {
        commandHandler = { handle: async () => {}, subscribedTo: () => PlaceBidCommand.COMMAND_NAME };
        commandHandlers = new CommandHandlers([commandHandler]);
        desiredItemsRepo = {
            save: async (desiredItem: DesiredItem) => {
                fakeDesiredItems.push(desiredItem);
            },
            findByName: async (name) => fakeDesiredItems.find((desired) => desired.name === name),
        };
        logger = { log: () => {} };
        loggerSpy = jest.spyOn(logger, "log");
        commandBus = new CommandBusInMemory(commandHandlers);
        dispatchCommandSpy = jest.spyOn(commandBus, "dispatch");
        itemListed = new ItemListedEventListener(desiredItemsRepo, logger, commandBus);
    });

    afterEach(() => (fakeDesiredItems.length = 0));

    it("Should evaluate and decide whether to place a bid on an item when all criteria are met", async () => {
        await desiredItemsRepo.save({
            name: "M4A4 | Cyber Security (Field-Tested)",
            criterias: [new MaxAboveRecommendedPercentage("-4.05")],
        });
        await itemListed.on(itemListedEvent);
        const [commandUsed] = dispatchCommandSpy.mock.calls[0];
        expect(dispatchCommandSpy).toHaveBeenCalledTimes(1);
        expect(commandUsed.name).toBe(PlaceBidCommand.COMMAND_NAME);
    });
    it("Should evaluate and decide not to place a bid on an item when certain criteria aren't met", async () => {
        await desiredItemsRepo.save({
            name: "M4A4 | Cyber Security (Field-Tested)",
            criterias: [new MaxAboveRecommendedPercentage("-4.06")],
        });
        await itemListed.on(itemListedEvent);
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(
            `The item "M4A4 | Cyber Security (Field-Tested)" did not meet criterion "IsEqualAboveRecommendedSpecification"`,
        );
        expect(dispatchCommandSpy).not.toHaveBeenCalled();
    });
});
