import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { CommandBus } from "@/packages/application/command-bus";
import type { NewItem } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/new-item";
import { EvaluateItemCommand } from "../../application/evaluate-item/evaluate-item.command";

export class NewItemWsController {
    constructor(wsClient: WsClient, commandBus: CommandBus) {
        wsClient.on("new_item", (data: NewItem) => {
            data.forEach((item) =>
                commandBus.dispatch(
                    new EvaluateItemCommand({
                        id: item.id,
                        itemName: item.market_name,
                        price: item.purchase_price,
                        referencePrice: item.suggested_price,
                        numberOfBids: item.auction_number_of_bids,
                        aboveRecommendedPercentage: item.above_recommended_price.toString(),
                        inAuction: !!item.auction_ends_at,
                    }),
                ),
            );
        });
    }
}
