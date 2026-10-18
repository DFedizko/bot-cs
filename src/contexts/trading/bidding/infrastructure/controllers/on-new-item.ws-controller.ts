import type { WsClient } from "@/shared/infrastructure/web-socket/ws-client";
import type { OnNewItemController } from "./on-new-item.controller";
import type { EventBus } from "@/shared/application/event-bus";
import type { NewItem } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/new-item";
import { SkinListedEvent } from "../../application/events/skin-listed.event";

export class OnNewItemWsController implements OnNewItemController {
    constructor(wsClient: WsClient, eventBus: EventBus) {
        wsClient.on("new_item", (data: NewItem[]) => {
            const events = data.map(
                (item) =>
                    new SkinListedEvent({
                        id: item.id,
                        name: item.market_name,
                        price: item.purchase_price,
                        referencePrice: item.suggested_price,
                        numberOfBids: item.auction_number_of_bids,
                        aboveRecommendedPercentage: item.above_recommended_price.toString(),
                    }),
            );
            eventBus.publish(events);
        });
    }
}
