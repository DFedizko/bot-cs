import { ItemApprovedInAuctionEvent } from "@/contexts/trading/bidding/application/place-bid/item-approved-in-auction.event";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import type { Mock } from "bun:test";
import { itemApprovedInAuctionEvent } from "./__mocks__/item-approved-in-auction.event.mock";
import { OnItemApprovedInAuctionPlaceBid } from "@/contexts/trading/bidding/application/place-bid/on-item-approved-in-auction-place-bid";

let commandBus: CommandBus;
let onItemApprovedInAuctionPlaceBid: EventListener<ItemApprovedInAuctionEvent>;
let dispatchSpy: Mock<CommandBus["dispatch"]>;
describe("OnItemApprovedInAuctionPlaceBid", () => {
    beforeEach(() => {
        commandBus = new CommandBusInMemory();
        commandBus.register({ handle: async () => {}, subscribedTo: () => PlaceBidCommand.COMMAND_NAME });
        onItemApprovedInAuctionPlaceBid = new OnItemApprovedInAuctionPlaceBid(commandBus);
        dispatchSpy = jest.spyOn(commandBus, "dispatch");
    });

    it("Should dispatch a command to place a bid", async () => {
        await onItemApprovedInAuctionPlaceBid.on(itemApprovedInAuctionEvent);
        const [command] = dispatchSpy.mock.calls[0] as [PlaceBidCommand];
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(command.name).toBe(PlaceBidCommand.COMMAND_NAME);
        expect(command.auctionId).toBe(itemApprovedInAuctionEvent.payload.auctionId);
        expect(command.bidValue).toBe(itemApprovedInAuctionEvent.payload.value);
    });
});
