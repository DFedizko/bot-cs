import type { CsgoempireAuctionHttp } from "../../../infrastructure/http/csgoempire/csgoempire-auction.http";
import type { PlaceBid } from "../../../infrastructure/http/csgoempire/place-bid";
import type { ActiveAuction, GetActiveAuctions } from "../../../infrastructure/http/csgoempire/get-active-auctions";
import { auctions } from "./__mocks__/auctions.mock";
import { NotFoundError } from "@/shared/infrastructure/http/errors/not-found.error";
import { invoice } from "./__mocks__/place-bid.mock";
import { CS_APP_ID } from "@/shared-kernel/domain/cs-app-id";

export class CsgoempireAuctionHttpFakeAdapter implements CsgoempireAuctionHttp {
    private readonly store: ActiveAuction[] = [];

    constructor() {
        auctions.active_auctions.forEach((auction) => this.store.push(auction));
    }

    async getActiveAuctions(): Promise<GetActiveAuctions.Response> {
        return { success: true, active_auctions: this.store };
    }

    async placeBid(request: PlaceBid.Request): Promise<PlaceBid.Response> {
        const auction = this.store.find((auction) => auction.id === Number(request.deposit_id));
        if (!auction) throw new NotFoundError();
        return {
            auction_data: {
                id: auction.id,
                auction_ends_at: auction.auction_ends_at,
                auction_highest_bid: auction.auction_highest_bid,
                auction_highest_bidder: auction.auction_highest_bidder,
                auction_number_of_bids: auction.auction_number_of_bids,
                above_recommended_price: auction.above_recommended_price,
                app_id: CS_APP_ID,
            },
            success: true,
            invoice,
        };
    }
}
