import type { AuctionUpdate } from "@/contexts/trading/shared/infrastructure/csgoempire/ws-events/auction-update";
import type { CommandDispatcher } from "@/packages/infrastructure/command-bus/command-dispatcher";
import { TrackAuctionUpdateCommand } from "../../application/track-auction-update/track-auction-update.command";
import type { CsgWsClient } from "@/contexts/trading/shared/infrastructure/csgoempire/csg.ws-client";

type AuctionUpdateEntry = AuctionUpdate[number];

export class AuctionUpdateWsController {
    constructor(
        private readonly csgWsClient: CsgWsClient,
        private readonly dispatcher: CommandDispatcher,
    ) {
        csgWsClient.on("auction_update", (data: AuctionUpdate) => data.forEach((auction) => this.track(auction)));
    }

    private track(auction: AuctionUpdateEntry): void {
        const accountId = this.csgWsClient.accountId;
        void this.dispatcher.dispatch(
            new TrackAuctionUpdateCommand({
                auctionId: auction.id,
                accountId,
                bidderId: auction.auction_highest_bidder,
                value: auction.auction_highest_bid,
                endsAt: auction.auction_ends_at,
            }),
            { auctionId: auction.id, accountId },
        );
    }
}
