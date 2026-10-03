import { AuctionId } from "@/contexts/trading/bidding/domain/value-objects/auction-id";
import { DomainEvent } from "@/shared/building-blocks/domain-event";

export class AuctionStartedDomainEvent extends DomainEvent<AuctionId> {
	static readonly EVENT_NAME = "auction_started";

    constructor(aggregateId: AuctionId) {
        super({ aggregateId, name: AuctionStartedDomainEvent.EVENT_NAME });
    }
}
