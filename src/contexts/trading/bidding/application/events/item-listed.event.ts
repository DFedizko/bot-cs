import { ApplicationEvent } from "@/shared/building-blocks/application-event";

type Payload = {
    id: number;
    name: string;
    price: number;
    aboveRecommendedPercentage: string;
    referencePrice: number;
    numberOfBids: number;
};

export class ItemListedEvent extends ApplicationEvent<Payload> {
    static readonly EVENT_NAME = "item_listed";

    constructor(payload: Payload) {
        super({ name: ItemListedEvent.EVENT_NAME, payload });
    }
}
