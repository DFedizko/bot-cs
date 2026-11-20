import { OfferRejectionReason } from "../offer-rejection-reason";
import { OfferRule } from "../offer-rule";
import type { ReceivedOffer } from "../received-offer";

export class GivesNoneOfOurItems extends OfferRule {
    readonly reason = OfferRejectionReason.ASKS_FOR_OUR_ITEMS;

    isSatisfiedBy(offer: ReceivedOffer): boolean {
        return offer.getItemsToGive().length === 0;
    }
}
