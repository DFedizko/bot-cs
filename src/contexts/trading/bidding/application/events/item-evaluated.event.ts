import { ApplicationEvent } from "@/packages/building-blocks/application-event";

type Payload = {
    auctionId: number;
    value: number;
};

export class ItemEvaluatedEvent extends ApplicationEvent<Payload> {
    static readonly EVENT_NAME = "item_evaluated";

    constructor(payload: Payload) {
        super({ name: ItemEvaluatedEvent.EVENT_NAME, payload });
    }
}
