import type { EventListener } from "@/packages/application/event-listener";
import { ItemApprovedOffAuctionEvent } from "./item-approved-off-auction.event";
import type { CommandBus } from "@/packages/application/command-bus";
import { WithdrawItemCommand } from "./withdraw-item.command";

export class OnItemApprovedOffAuctionWithdraw implements EventListener<ItemApprovedOffAuctionEvent> {
    constructor(private readonly commandBus: CommandBus) {}

    subscribedTo(): string {
        return ItemApprovedOffAuctionEvent.EVENT_NAME;
    }

    async on(event: ItemApprovedOffAuctionEvent): Promise<void> {
        const { itemId, value } = event.payload;
        await this.commandBus.dispatch(new WithdrawItemCommand({ itemId, value }));
    }
}
