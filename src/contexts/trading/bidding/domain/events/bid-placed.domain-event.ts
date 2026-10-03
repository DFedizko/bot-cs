import { DomainEvent } from "@/shared/building-blocks/domain-event";
import { AuctionId } from "../value-objects/auction-id";

export class BidPlacedDomainEvent extends DomainEvent<AuctionId> {
    static readonly EVENT_NAME = "bid_placed";

    constructor(aggregateId: AuctionId) {
        super({ aggregateId, name: BidPlacedDomainEvent.EVENT_NAME });
    }
}
