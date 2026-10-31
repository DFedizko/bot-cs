import { TrackAuctionUpdateCommand } from "@/contexts/trading/bidding/application/track-auction-update/track-auction-update.command";

const THIRTY_SECONDS_IN_MS = 30000;

export const trackAuctionUpdateCommand = (overrides?: { auctionId?: number; bidderId?: number }) =>
    new TrackAuctionUpdateCommand({
        auctionId: overrides?.auctionId ?? 1,
        bidderId: overrides?.bidderId ?? 2,
        value: 20000,
        endsAt: Date.now() + THIRTY_SECONDS_IN_MS,
    });
