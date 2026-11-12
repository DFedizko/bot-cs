import type { AuctionUpdate } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/auction-update";
import type { CommandBus } from "@/packages/application/command-bus";
import { TrackAuctionUpdateCommand } from "../../application/track-auction-update/track-auction-update.command";
import type { CsgWsClient } from "@/contexts/trading/shared/infrastructure/csgoempire/csg.ws-client";

export class AuctionUpdateWsController {
    constructor(csgWsClient: CsgWsClient, commandBus: CommandBus) {
        csgWsClient.on("auction_update", (data: AuctionUpdate) => {
            data.forEach((auction) =>
                commandBus.dispatch(
                    new TrackAuctionUpdateCommand({
                        auctionId: auction.id,
                        accountId: csgWsClient.accountId,
                        bidderId: auction.auction_highest_bidder,
                        value: auction.auction_highest_bid,
                        endsAt: auction.auction_ends_at,
                    }),
                ),
            );
        });
    }
}
