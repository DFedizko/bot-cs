import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { EventBus } from "@/packages/application/event-bus";
import type { AuctionUpdate } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/auction-update";
import { OutbidEvent } from "../../application/events/outbid.event";

export class AuctionUpdateWsController {
    constructor(wsClient: WsClient, eventBus: EventBus) {
        wsClient.on("auction_update", (data: AuctionUpdate) => {
            const events = data.map(
                (auction) =>
                    new OutbidEvent({
                        id: auction.id,
                        bidderId: auction.auction_highest_bidder,
                        value: auction.auction_highest_bid,
                        endsAt: auction.auction_ends_at,
                    }),
            );
            eventBus.publish(events);
        });
    }
}
