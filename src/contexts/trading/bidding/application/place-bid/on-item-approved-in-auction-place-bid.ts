import type { EventListener } from "@/packages/application/event-listener";
import { ItemApprovedInAuctionEvent } from "../events/item-approved-in-auction.event";
import type { CommandBus } from "@/packages/application/command-bus";
import { PlaceBidCommand } from "./place-bid.command";

export class OnItemApprovedInAuctionPlaceBid implements EventListener<ItemApprovedInAuctionEvent> {
    constructor(private readonly commandBus: CommandBus) {}

    subscribedTo(): string {
        return ItemApprovedInAuctionEvent.EVENT_NAME;
    }

    async on(event: ItemApprovedInAuctionEvent): Promise<void> {
        const { auctionId, value } = event.payload;
        await this.commandBus.dispatch(new PlaceBidCommand({ auctionId, bidValue: value }));
    }
}
