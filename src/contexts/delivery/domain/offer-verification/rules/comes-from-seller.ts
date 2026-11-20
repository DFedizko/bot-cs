import { OfferRejectionReason } from "../offer-rejection-reason";
import { OfferRule } from "../offer-rule";
import type { ReceivedOffer } from "../received-offer";

export class ComesFromSeller extends OfferRule {
    readonly reason = OfferRejectionReason.UNEXPECTED_PARTNER;

    constructor(private readonly sellerSteamId: string) {
        super();
    }

    isSatisfiedBy(offer: ReceivedOffer): boolean {
        return offer.getPartnerSteamId() === this.sellerSteamId;
    }
}
