import type { ItemApprovedOffAuctionEvent } from "@/contexts/trading/bidding/application/evaluate-item/item-approved-off-auction.event";
import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS } from "@/packages/external/di/packages.identifiers";
import { ON_APPROVED_OFF_AUCTION } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import type { Mock } from "bun:test";
import { itemApprovedOffAuctionEvent } from "../evaluate-item/__mocks__/item-approved-off-auction.event.mock";
import { WithdrawItemCommand } from "@/contexts/trading/bidding/application/withdraw-item/withdraw-item.command";

let commandBus: CommandBus;
let dispatchSpy: Mock<CommandBus["dispatch"]>;
let onItemApprovedOffAuctionWithdraw: EventListener<ItemApprovedOffAuctionEvent>;
describe("OnItemApprovedOffAuctionWithdraw", () => {
    beforeEach(() => {
        const container = testContainer();
        commandBus = container.get(COMMAND_BUS);
        dispatchSpy = jest.spyOn(commandBus, "dispatch").mockResolvedValue();
        onItemApprovedOffAuctionWithdraw = container.get(ON_APPROVED_OFF_AUCTION);
    });

    it("Should dispatch a command to withdraw an item", async () => {
        await onItemApprovedOffAuctionWithdraw.on(itemApprovedOffAuctionEvent);
        const [command] = dispatchSpy.mock.calls[0] as [WithdrawItemCommand];
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(command.name).toBe(WithdrawItemCommand.COMMAND_NAME);
        expect(command.itemId).toBe(itemApprovedOffAuctionEvent.payload.itemId);
        expect(command.accountId).toBe(itemApprovedOffAuctionEvent.payload.accountId);
        expect(command.value).toBe(itemApprovedOffAuctionEvent.payload.value);
    });
});
