import type { Container } from "inversify";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { ON_APPROVED_IN_AUCTION } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { itemApprovedInAuctionEvent } from "../evaluate-item/__mocks__/item-approved-in-auction.event.mock";

let container: Container;

describe("OnItemApprovedInAuctionPlaceBid", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should dispatch a command to place a bid", async () => {
        const dispatchSpy = jest.spyOn(container.get(COMMAND_BUS), "dispatch").mockResolvedValue();

        await container.get(ON_APPROVED_IN_AUCTION).on(itemApprovedInAuctionEvent);

        const [command] = dispatchSpy.mock.calls[0] as [PlaceBidCommand];
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(command.name).toBe(PlaceBidCommand.COMMAND_NAME);
        expect(command.auctionId).toBe(itemApprovedInAuctionEvent.payload.auctionId);
        expect(command.accountId).toBe(itemApprovedInAuctionEvent.payload.accountId);
        expect(command.bidValue).toBe(itemApprovedInAuctionEvent.payload.value);
        expect(command.maxBid).toBe(itemApprovedInAuctionEvent.payload.maxPrice);
    });
});
