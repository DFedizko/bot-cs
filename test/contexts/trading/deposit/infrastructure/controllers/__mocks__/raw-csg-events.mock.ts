export const OUR_DEPOSIT_ITEM_ID = 4209852853;
export const OUR_FAILED_ITEM_ID = 30013;
export const OTHER_ITEM_ID = 148844336;
export const CAPTURED_AT_MS = 1_795_000_000_000;
export const CAPTURED_AT = new Date(CAPTURED_AT_MS).toISOString();

export const depositTradeStatus = (itemId = OUR_DEPOSIT_ITEM_ID) => [
    { type: "deposit", data: { id: 291452362, item_id: itemId, status: 0, status_message: "Pending" } },
];

export const depositTradeStatusWithItemOnly = (itemId = OUR_DEPOSIT_ITEM_ID) => [
    { type: "deposit", data: { id: 291452362, status: 0, item: { id: itemId } } },
];

export const withdrawalTradeStatus = (itemId = OUR_DEPOSIT_ITEM_ID) => [
    { type: "withdrawal", data: { id: 291452363, item_id: itemId, status: 5, status_message: "Sent" } },
];

export const depositFailed = (itemId = OUR_FAILED_ITEM_ID) => [
    {
        response: {
            data: {
                success: false,
                message: "Item already deposited",
                error_key: "item_already_deposited",
                item_id: itemId,
            },
            status: 400,
            statusText: "Bad Request",
        },
    },
];

export const auctionUpdateEntry = (id: number) => ({
    id,
    above_recommended_price: 2,
    auction_highest_bid: 1069,
    auction_highest_bidder: 7654321,
    auction_number_of_bids: 1,
    auction_ends_at: 1795000180,
});

export const auctionUpdate = (ids: number[]) => ids.map(auctionUpdateEntry);
