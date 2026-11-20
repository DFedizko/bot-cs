import type { ExpectedItem } from "../../delivery/expected-item";
import { OfferRejectionReason } from "../offer-rejection-reason";
import { OfferRule } from "../offer-rule";
import type { OfferItem, ReceivedOffer } from "../received-offer";

const EXPECTED_ITEM_COUNT = 1;

export class CarriesOnlyExpectedItem extends OfferRule {
    readonly reason = OfferRejectionReason.WRONG_ITEMS;

    constructor(private readonly expectedItem: ExpectedItem) {
        super();
    }

    isSatisfiedBy(offer: ReceivedOffer): boolean {
        const items = offer.getItemsToReceive();
        return items.length === EXPECTED_ITEM_COUNT && items.every((item) => this.isExpected(item));
    }

    private isExpected(item: OfferItem): boolean {
        return this.expectedItem.isSameAsset(item.assetId, item.appId);
    }
}
