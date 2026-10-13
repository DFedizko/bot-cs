import { SkinListedEventListener } from "@/contexts/trading/bidding/application/event-listeners/skin-listed.event-listener";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/commands/place-bid.command";
import type { SkinListedEvent } from "@/contexts/trading/bidding/application/events/skin-listed.event";
import type { EventListener } from "@/shared/application/event-listener";
import { CommandBusInMemory } from "@/shared/external/command-bus/command-bus.in-memory";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import { CommandHandlers } from "@/shared/infrastructure/command-bus/command-handlers";
import { skinListedEvent } from "./__mocks__/skin-listed.event.mock";
import type { Mock } from "bun:test";
import { MaxAboveRecommendedPercentage } from "@/contexts/trading/bidding/domain/wanted-skin/criteria/max-above-recommended-percentage";
import { CommandHandler } from "@/shared/building-blocks/command-handler";
import type { Logger } from "@/shared/application/logger";
import { WantedSkin } from "@/contexts/trading/bidding/domain/wanted-skin/wanted-skin";
import { WantedSkinRepository } from "@/contexts/trading/bidding/application/repositories/wanted-skin.repository";

let commandHandler: CommandHandler<PlaceBidCommand>;
let commandHandlers: CommandHandlers;
let wantedSkinRepo: WantedSkinRepository;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let commandBus: CommandBus;
let dispatchCommandSpy: Mock<CommandBus["dispatch"]>;
let skinListed: EventListener<SkinListedEvent>;
const fakeWantedSkins: WantedSkin[] = [];
describe("ItemListedEventListener", () => {
    beforeEach(() => {
        commandHandler = { handle: async () => {}, subscribedTo: () => PlaceBidCommand.COMMAND_NAME };
        commandHandlers = new CommandHandlers([commandHandler]);
        wantedSkinRepo = {
            save: async (wantedSkin: WantedSkin) => {
                fakeWantedSkins.push(wantedSkin);
            },
            findByName: async (name) => fakeWantedSkins.find((wanted) => wanted.getName() === name),
        };
        logger = { log: () => {} };
        loggerSpy = jest.spyOn(logger, "log");
        commandBus = new CommandBusInMemory(commandHandlers);
        dispatchCommandSpy = jest.spyOn(commandBus, "dispatch");
        skinListed = new SkinListedEventListener(wantedSkinRepo, logger, commandBus);
    });

    afterEach(() => (fakeWantedSkins.length = 0));

    it("Should evaluate and decide whether to place a bid on an item when all criteria are met", async () => {
        await wantedSkinRepo.save(
            WantedSkin.create({
                name: "M4A4 | Cyber Security (Field-Tested)",
                criteria: [new MaxAboveRecommendedPercentage("-4.05")],
            }),
        );
        await skinListed.on(skinListedEvent);
        const [commandUsed] = dispatchCommandSpy.mock.calls[0];
        expect(dispatchCommandSpy).toHaveBeenCalledTimes(1);
        expect(commandUsed.name).toBe(PlaceBidCommand.COMMAND_NAME);
    });
    it("Should evaluate and decide not to place a bid on an item when certain criteria aren't met", async () => {
        await wantedSkinRepo.save(
            WantedSkin.create({
                name: "M4A4 | Cyber Security (Field-Tested)",
                criteria: [new MaxAboveRecommendedPercentage("-4.06")],
            }),
        );
        await skinListed.on(skinListedEvent);
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(
            `The item "M4A4 | Cyber Security (Field-Tested)" did not meet criterion "IsEqualAboveRecommendedSpecification"`,
        );
        expect(dispatchCommandSpy).not.toHaveBeenCalled();
    });
});
