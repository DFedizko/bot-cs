import { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { ON_APPROVED_IN_AUCTION } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import type { Mock } from "bun:test";
import { itemApprovedInAuctionEvent } from "../evaluate-item/__mocks__/item-approved-in-auction.event.mock";
import type { ItemApprovedInAuctionEvent } from "@/contexts/trading/bidding/application/evaluate-item/item-approved-in-auction.event";

let commandBus: CommandBus;
let onItemApprovedInAuctionPlaceBid: EventListener<ItemApprovedInAuctionEvent>;
let dispatchSpy: Mock<CommandBus["dispatch"]>;
describe("OnItemApprovedInAuctionPlaceBid", () => {
    beforeEach(() => {
        const container = testContainer();
        commandBus = container.get(COMMAND_BUS);
        onItemApprovedInAuctionPlaceBid = container.get(ON_APPROVED_IN_AUCTION);
        dispatchSpy = jest.spyOn(commandBus, "dispatch").mockResolvedValue();
    });

    it("Should dispatch a command to place a bid", async () => {
        await onItemApprovedInAuctionPlaceBid.on(itemApprovedInAuctionEvent);
        const [command] = dispatchSpy.mock.calls[0] as [PlaceBidCommand];
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(command.name).toBe(PlaceBidCommand.COMMAND_NAME);
        expect(command.auctionId).toBe(itemApprovedInAuctionEvent.payload.auctionId);
        expect(command.accountId).toBe(itemApprovedInAuctionEvent.payload.accountId);
        expect(command.bidValue).toBe(itemApprovedInAuctionEvent.payload.value);
        expect(command.maxBid).toBe(itemApprovedInAuctionEvent.payload.maxPrice);
    });
});
