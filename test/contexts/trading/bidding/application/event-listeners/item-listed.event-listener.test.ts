import { PlaceBidCommandHandler } from "@/contexts/trading/bidding/application/command-handlers/place-bid.command-handler";
import type { PlaceBidCommand } from "@/contexts/trading/bidding/application/commands/place-bid.command";
import { ItemListedEventListener } from "@/contexts/trading/bidding/application/event-listeners/item-listed.event-listener";
import type { ItemListedEvent } from "@/contexts/trading/bidding/application/events/item-listed.event";
import type { EventListener } from "@/shared/application/event-listener";
import type { CommandHandler } from "@/shared/building-blocks/command-handler";
import { CommandBusInMemory } from "@/shared/external/command-bus/command-bus.in-memory";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import { CommandHandlers } from "@/shared/infrastructure/command-bus/command-handlers";
import { itemListedEvent } from "./__mocks__/item-listed.event.mock";

// let csgoempireClient: CsgoempireClient;
let auctionGateway: AuctionGateway;
let placeBidCommandHandler: CommandHandler<PlaceBidCommand>;
let commandHandlers: CommandHandlers;
let itemListed: EventListener<ItemListedEvent>;
let commandBus: CommandBus;
describe("OnItemListedEventListener", () => {
    beforeEach(() => {
        // csgoempireClient = new CsgoempireClient();
        auctionGateway = new AuctionGatewayCsgoempireAdapter(csgoempireClient);
        placeBidCommandHandler = new PlaceBidCommandHandler(auctionGateway);
        commandHandlers = new CommandHandlers([placeBidCommandHandler]);
        commandBus = new CommandBusInMemory(commandHandlers);
        itemListed = new ItemListedEventListener(commnadBus);
    });

    it("Should evaluate an item", async () => {
        await itemListed.on(itemListedEvent);
    });
});
