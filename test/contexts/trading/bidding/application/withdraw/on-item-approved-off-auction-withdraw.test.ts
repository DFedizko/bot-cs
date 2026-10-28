import type { ItemApprovedOffAuctionEvent } from "@/contexts/trading/bidding/application/events/item-approved-off-auction.event";
import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import type { Mock } from "bun:test";
import { itemApprovedOffAuctionEvent } from "./__mocks__/item-approved-off-auction.event.mock";
import { OnItemApprovedOffAuctionWithdraw } from "@/contexts/trading/bidding/application/withdraw/on-item-approved-off-auction-withdraw";
import { WithdrawItemCommand } from "@/contexts/trading/bidding/application/withdraw/withdraw-item.command";

let commandBus: CommandBus;
let dispatchSpy: Mock<CommandBus["dispatch"]>;
let onItemApprovedOffAuctionWithdraw: EventListener<ItemApprovedOffAuctionEvent>;
describe("OnItemApprovedOffAuctionWithdraw", () => {
    beforeEach(() => {
        commandBus = new CommandBusInMemory();
        commandBus.register({ handle: async () => {}, subscribedTo: () => WithdrawItemCommand.COMMAND_NAME });
        dispatchSpy = jest.spyOn(commandBus, "dispatch");
        onItemApprovedOffAuctionWithdraw = new OnItemApprovedOffAuctionWithdraw(commandBus);
    });

    it("Should dispatch a command to withdraw an item", async () => {
        await onItemApprovedOffAuctionWithdraw.on(itemApprovedOffAuctionEvent);
        const [command] = dispatchSpy.mock.calls[0] as [WithdrawItemCommand];
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(command.name).toBe(WithdrawItemCommand.COMMAND_NAME);
        expect(command.itemId).toBe(itemApprovedOffAuctionEvent.payload.itemId);
        expect(command.value).toBe(itemApprovedOffAuctionEvent.payload.value);
    });
});
