import { ApplicationEvent } from "@/packages/building-blocks/application-event";

type Payload = {
    itemId: number;
    value: number;
};

export class ItemApprovedOffAuctionEvent extends ApplicationEvent<Payload> {
    static readonly EVENT_NAME = "item_approved_off_auction";

    constructor(payload: Payload) {
        super({ name: ItemApprovedOffAuctionEvent.EVENT_NAME, payload });
    }
}
