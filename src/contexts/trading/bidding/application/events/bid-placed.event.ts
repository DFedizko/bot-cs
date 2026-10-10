import { ApplicationEvent } from "@/shared/building-blocks/application-event";

type BidPlacedPayload = { auctionId: number; bidValue: number; bidderId: number };

export class BidPlacedEvent extends ApplicationEvent<BidPlacedPayload> {
    static readonly EVENT_NAME = "bid_placed";

    constructor(payload: BidPlacedPayload) {
        super({ name: BidPlacedEvent.EVENT_NAME, payload });
    }
}
