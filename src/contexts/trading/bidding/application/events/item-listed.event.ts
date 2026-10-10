import { ApplicationEvent } from "@/shared/building-blocks/application-event";

type Payload = {
    itemId: number;
    itemName: string;
    numberOfBids: number;
    price: number;
    referencePrice: number;
    aboveRecommendedPercentage: string;
};

export class ItemListedEvent extends ApplicationEvent<Payload> {
    static readonly EVENT_NAME = "item_listed";

    constructor(payload: Payload) {
        super({ name: ItemListedEvent.EVENT_NAME, payload });
    }
}
