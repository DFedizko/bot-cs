import { OfferRejectionReason } from "../offer-rejection-reason";
import { OfferRule } from "../offer-rule";
import type { ReceivedOffer } from "../received-offer";

const NO_HOLD_DAYS = 0;

export class HasNoTradeHold extends OfferRule {
    readonly reason = OfferRejectionReason.TRADE_HOLD;

    isSatisfiedBy(offer: ReceivedOffer): boolean {
        return offer.getEscrowDays() === NO_HOLD_DAYS;
    }
}
