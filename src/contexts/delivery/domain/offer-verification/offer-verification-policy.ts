import type { Delivery } from "../delivery/delivery";
import type { OfferRule } from "./offer-rule";
import { OfferVerdict } from "./offer-verdict";
import type { ReceivedOffer } from "./received-offer";
import { CarriesOnlyExpectedItem } from "./rules/carries-only-expected-item";
import { ComesFromSeller } from "./rules/comes-from-seller";
import { GivesNoneOfOurItems } from "./rules/gives-none-of-our-items";
import { HasNoTradeHold } from "./rules/has-no-trade-hold";
import { IsActive } from "./rules/is-active";
import { IsNotGlitched } from "./rules/is-not-glitched";

export class OfferVerificationPolicy {
    private constructor(private readonly rules: readonly OfferRule[]) {}

    static forDelivery(delivery: Delivery): OfferVerificationPolicy {
        const sellerSteamId = delivery.getSellerSteamId();
        const sellerRules = sellerSteamId === undefined ? [] : [new ComesFromSeller(sellerSteamId)];
        return new OfferVerificationPolicy([
            new GivesNoneOfOurItems(),
            new CarriesOnlyExpectedItem(delivery.getExpectedItem()),
            ...sellerRules,
            new HasNoTradeHold(),
            new IsActive(),
            new IsNotGlitched(),
        ]);
    }

    verify(offer: ReceivedOffer): OfferVerdict {
        const broken = this.rules.filter((rule) => !rule.isSatisfiedBy(offer));
        return new OfferVerdict(
            offer.getId(),
            broken.map((rule) => rule.reason),
        );
    }
}
