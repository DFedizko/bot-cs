import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import { TradeOfferAcceptedEvent } from "@/contexts/delivery/domain/delivery/events/trade-offer-accepted.event";
import { DeliveryConfirmedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-confirmed.event";
import { ScamOfferFoundEvent } from "@/contexts/delivery/application/accept-delivery-offer/scam-offer-found.event";
import { ACCOUNT_ID, TRADE_ID, TRADE_OFFER_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";
import { OTHER_OFFER_ID } from "../../external/steam/__mocks__/steam-trade-offer.mock";

const identity = { tradeId: TRADE_ID, tradeOfferId: TRADE_OFFER_ID, accountId: ACCOUNT_ID };

export const SCAM_REASONS = ["asks_for_our_items"];

export const tradeOfferAcceptedEvent = (): TradeOfferAcceptedEvent =>
    new TradeOfferAcceptedEvent(new TradeId(TRADE_ID), { ...identity, offerId: OFFER_ID, needsConfirmation: true });

export const deliveryConfirmedEvent = (): DeliveryConfirmedEvent =>
    new DeliveryConfirmedEvent(new TradeId(TRADE_ID), { ...identity, offerId: OFFER_ID });

export const scamOfferFoundEvent = (): ScamOfferFoundEvent =>
    new ScamOfferFoundEvent({
        tradeId: TRADE_ID,
        accountId: ACCOUNT_ID,
        offerId: OTHER_OFFER_ID,
        reasons: SCAM_REASONS,
    });
