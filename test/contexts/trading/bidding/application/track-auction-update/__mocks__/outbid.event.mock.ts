import { OutbidEvent } from "@/contexts/trading/bidding/application/track-auction-update/outbid.event";

const THIRTY_SECONDS_IN_MS = 30000;

export const outbidEvent = (overrides?: { bidValue?: number }) =>
    new OutbidEvent({
        auctionId: 288767047,
        accountId: 1,
        value: overrides?.bidValue ?? 3656,
        endsAt: Date.now() + THIRTY_SECONDS_IN_MS,
    });
