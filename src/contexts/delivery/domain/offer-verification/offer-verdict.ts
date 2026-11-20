import { OfferRejectionReason } from "./offer-rejection-reason";

export class OfferVerdict {
    constructor(
        private readonly offerId: string,
        private readonly reasons: readonly OfferRejectionReason[],
    ) {}

    getOfferId(): string {
        return this.offerId;
    }

    getReasons(): readonly OfferRejectionReason[] {
        return this.reasons;
    }

    isAccepted(): boolean {
        return this.reasons.length === 0;
    }

    shouldBeCancelled(): boolean {
        return this.reasons.includes(OfferRejectionReason.ASKS_FOR_OUR_ITEMS);
    }
}
