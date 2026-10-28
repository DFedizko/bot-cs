import { ApplicationEvent } from "@/packages/building-blocks/application-event";

type Payload = {
    auctionId: number;
    value: number;
    numberOfBids: number;
};

export class ItemApprovedInAuctionEvent extends ApplicationEvent<Payload> {
    static readonly EVENT_NAME = "item_approved_in_auction";

    constructor(payload: Payload) {
        super({ name: ItemApprovedInAuctionEvent.EVENT_NAME, payload });
    }
}
