import type { Container } from "inversify";
import { WithdrawItemCommand } from "@/contexts/trading/bidding/application/withdraw-item/withdraw-item.command";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { ON_APPROVED_OFF_AUCTION } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { itemApprovedOffAuctionEvent } from "../evaluate-item/__mocks__/item-approved-off-auction.event.mock";

let container: Container;

describe("OnItemApprovedOffAuctionWithdraw", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should dispatch a command to withdraw an item", async () => {
        const dispatchSpy = jest.spyOn(container.get(COMMAND_BUS), "dispatch").mockResolvedValue();

        await container.get(ON_APPROVED_OFF_AUCTION).on(itemApprovedOffAuctionEvent);

        const [command] = dispatchSpy.mock.calls[0] as [WithdrawItemCommand];
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(command.name).toBe(WithdrawItemCommand.COMMAND_NAME);
        expect(command.itemId).toBe(itemApprovedOffAuctionEvent.payload.itemId);
        expect(command.accountId).toBe(itemApprovedOffAuctionEvent.payload.accountId);
        expect(command.value).toBe(itemApprovedOffAuctionEvent.payload.value);
    });
});
