import type { CommandDispatcher } from "@/packages/infrastructure/command-bus/command-dispatcher";
import type { NewItem } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/new-item";
import { EvaluateItemCommand } from "../../application/evaluate-item/evaluate-item.command";
import type { CsgWsClient } from "@/contexts/trading/shared/infrastructure/csgoempire/csg.ws-client";

type NewItemEntry = NewItem[number];

export class NewItemWsController {
    constructor(
        private readonly csgWsClient: CsgWsClient,
        private readonly dispatcher: CommandDispatcher,
    ) {
        csgWsClient.on("new_item", (data: NewItem) => data.forEach((item) => this.evaluate(item)));
    }

    private evaluate(item: NewItemEntry): void {
        const accountId = this.csgWsClient.accountId;
        void this.dispatcher.dispatch(
            new EvaluateItemCommand({
                itemId: item.id,
                accountId,
                itemName: item.market_name,
                price: item.purchase_price,
                referencePrice: item.suggested_price,
                aboveRecommendedPercentage: item.above_recommended_price.toString(),
                inAuction: !!item.auction_ends_at,
            }),
            { itemId: item.id, accountId },
        );
    }
}
