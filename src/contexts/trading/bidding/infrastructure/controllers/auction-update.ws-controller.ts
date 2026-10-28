import type { WsClient } from "@/packages/infrastructure/web-socket/ws-client";
import type { AuctionUpdate } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/auction-update";
import type { CommandBus } from "@/packages/application/command-bus";
import { TrackAuctionUpdateCommand } from "../../application/track-auction-update/track-auction-update.command";

export class AuctionUpdateWsController {
    constructor(wsClient: WsClient, commandBus: CommandBus) {
        wsClient.on("auction_update", (data: AuctionUpdate) => {
            data.forEach((auction) =>
                commandBus.dispatch(
                    new TrackAuctionUpdateCommand({
                        id: auction.id,
                        bidderId: auction.auction_highest_bidder,
                        value: auction.auction_highest_bid,
                        endsAt: auction.auction_ends_at,
                    }),
                ),
            );
        });
    }
}
