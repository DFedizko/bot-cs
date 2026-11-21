import { OfferRejectionReason } from "../offer-rejection-reason";
import { OfferRule } from "../offer-rule";
import type { ReceivedOffer } from "../received-offer";

export class IsNotGlitched extends OfferRule {
    readonly reason = OfferRejectionReason.GLITCHED;

    isSatisfiedBy(offer: ReceivedOffer): boolean {
        return !offer.isGlitched();
    }
}
