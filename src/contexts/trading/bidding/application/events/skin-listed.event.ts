import { ApplicationEvent } from "@/shared/building-blocks/application-event";

type Payload = {
    id: number;
    name: string;
    price: number;
    aboveRecommendedPercentage: string;
    referencePrice: number;
    numberOfBids: number;
    inAuction: boolean;
};

export class SkinListedEvent extends ApplicationEvent<Payload> {
    static readonly EVENT_NAME = "skin_listed";

    constructor(payload: Payload) {
        super({ name: SkinListedEvent.EVENT_NAME, payload });
    }
}
