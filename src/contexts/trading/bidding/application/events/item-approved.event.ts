import { ApplicationEvent } from "@/packages/building-blocks/application-event";

type Payload = {
    auctionId: number;
    numberOfBids: number;
    value: number;
};

export class ItemApprovedEvent extends ApplicationEvent<Payload> {
    static readonly EVENT_NAME = "item_approved";

    constructor(payload: Payload) {
        super({ name: ItemApprovedEvent.EVENT_NAME, payload });
    }
}
