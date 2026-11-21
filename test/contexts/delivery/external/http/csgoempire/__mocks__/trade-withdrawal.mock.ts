import type { TradeWithdrawal } from "@/contexts/delivery/infrastructure/http/csgoempire/types/trade-withdrawal";
import type { GetActiveTrades } from "@/contexts/delivery/infrastructure/http/csgoempire/get-active-trades";
import {
    ASSET_ID,
    MARKET_NAME,
    SELLER_STEAM_ID,
    TRADE_ID,
    TRADE_OFFER_ID,
} from "@/contexts/delivery/domain/__builders__/delivery.builder";

export const tradeWithdrawal = (overrides: Partial<TradeWithdrawal> = {}): TradeWithdrawal => ({
    id: TRADE_ID,
    total_value: 700,
    item_id: 4209852853,
    item: {
        asset_id: Number(ASSET_ID),
        blue_percentage: null,
        fade_percentage: null,
        icon_url:
            "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FA957P3dcjFH7c6Jh4uem_vnDKnUkmld_cBOhuDG_Zi7iQ2w_RU5Z26md4TDewQ-aF7ZrAC6wL-81pK9tZXPy3pr7yl243eLmgv3309_PudPMg",
        id: 4209852853,
        is_commodity: false,
        market_name: MARKET_NAME,
        market_value: 700,
        name_color: "D2D2D2",
        preview_id: "44f1edad452a",
        price_is_unreliable: false,
        stickers: [],
        suggested_price: 652,
        type: "Classified Rifle",
        wear: 0.271,
        marketplace_privacy_protection_level: "base",
    },
    status: 5,
    status_message: "Sent",
    tradeoffer_id: TRADE_OFFER_ID,
    metadata: {
        item_validation: { validItemDetected: true, validatedAt: 1740426216 },
        expires_at: 1740426816,
        partner: {
            steam_id: SELLER_STEAM_ID,
            steam_name: "exampleProfile",
            avatar: "https://avatars.steamstatic.com/60d676610e6303f1f5fde66f307dbe753fc91221.jpg",
            avatar_full: "https://avatars.steamstatic.com/60d676610e6303f1f5fde66f307dbe753fc91221_full.jpg",
            profile_url: `https://steamcommunity.com/profiles/${SELLER_STEAM_ID}`,
            timecreated: 171313223,
            steam_level: 10,
        },
    },
    created_at: "2025-02-25 01:01:01",
    updated_at: "2025-02-25 02:02:02",
    ...overrides,
});

export const activeTrades = (withdrawals: TradeWithdrawal[] = []) =>
    ({ success: true, data: { deposits: [], withdrawals } }) satisfies GetActiveTrades.Response;
