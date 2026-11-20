import { OfferRejectionReason } from "../offer-rejection-reason";
import { OfferRule } from "../offer-rule";
import type { ReceivedOffer } from "../received-offer";

export class IsActive extends OfferRule {
    readonly reason = OfferRejectionReason.NOT_ACTIVE;

    isSatisfiedBy(offer: ReceivedOffer): boolean {
        return offer.isActive();
    }
}
