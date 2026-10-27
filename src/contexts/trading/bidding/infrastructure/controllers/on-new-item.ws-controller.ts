import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { EventBus } from "@/packages/application/event-bus";
import type { NewItem } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/new-item";
import { SkinListedEvent } from "../../application/events/skin-listed.event";

export class OnNewItemWsController {
    constructor(wsClient: WsClient, eventBus: EventBus) {
        wsClient.on("new_item", (data: NewItem) => {
            const events = data.map(
                (item) =>
                    new SkinListedEvent({
                        id: item.id,
                        name: item.market_name,
                        price: item.purchase_price,
                        referencePrice: item.suggested_price,
                        numberOfBids: item.auction_number_of_bids,
                        aboveRecommendedPercentage: item.above_recommended_price.toString(),
                        inAuction: !!item.auction_ends_at,
                    }),
            );
            eventBus.publish(events);
        });
    }
}
