import { TradeId } from "@/contexts/delivery/domain/delivery/trade-id";
import { DeliveryReceivedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-received.event";
import { DeliveryDisputedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-disputed.event";
import { DeliveryFailedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-failed.event";
import { DeliveryCancelledEvent } from "@/contexts/delivery/domain/delivery/events/delivery-cancelled.event";
import { DeliveryFailureReason } from "@/contexts/delivery/domain/delivery/delivery-failure-reason";
import type { DeliveryIdentity } from "@/contexts/delivery/domain/delivery/events/delivery-identity";
import type { Event } from "@/packages/building-blocks/event";
import { ACCOUNT_ID, TRADE_ID, TRADE_OFFER_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";

const identity = { tradeId: TRADE_ID, tradeOfferId: TRADE_OFFER_ID, accountId: ACCOUNT_ID };
const tradeId = new TradeId(TRADE_ID);

const ENDED_EVENTS: Record<string, () => Event<DeliveryIdentity>> = {
    [DeliveryReceivedEvent.EVENT_NAME]: () => new DeliveryReceivedEvent(tradeId, { ...identity, offerId: OFFER_ID }),
    [DeliveryDisputedEvent.EVENT_NAME]: () => new DeliveryDisputedEvent(tradeId, identity),
    [DeliveryFailedEvent.EVENT_NAME]: () =>
        new DeliveryFailedEvent(tradeId, { ...identity, reason: DeliveryFailureReason.TRADE_HOLD }),
    [DeliveryCancelledEvent.EVENT_NAME]: () => new DeliveryCancelledEvent(tradeId, identity),
};

export const DELIVERY_ENDING_EVENTS = Object.keys(ENDED_EVENTS);

export const deliveryEndedEvent = (eventName: string): Event<DeliveryIdentity> => ENDED_EVENTS[eventName]!();
