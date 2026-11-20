import { OfferVerificationPolicy } from "@/contexts/delivery/domain/offer-verification/offer-verification-policy";
import { OfferRejectionReason } from "@/contexts/delivery/domain/offer-verification/offer-rejection-reason";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";
import { delivery } from "../__builders__/delivery.builder";
import {
    expectedOfferItem,
    OFFER_ID,
    OTHER_ASSET_ID,
    OTHER_STEAM_ID,
    receivedOffer,
} from "../__builders__/received-offer.builder";

const OTHER_APP_ID = 440;
const HOLD_DAYS = 15;

const policy = (sellerKnown = true): OfferVerificationPolicy =>
    OfferVerificationPolicy.forDelivery(delivery(sellerKnown ? {} : { sellerSteamId: undefined }));

describe("OfferVerificationPolicy", () => {
    it("Should accept the offer carrying exactly the expected item from the seller", () => {
        const verdict = policy().verify(receivedOffer());

        expect(verdict.isAccepted()).toBe(true);
    });

    it("Should name the offer it judged", () => {
        const verdict = policy().verify(receivedOffer());

        expect(verdict.getOfferId()).toBe(OFFER_ID);
    });

    describe("Scam: the offer asks for our items", () => {
        const askingOffer = () => receivedOffer({ itemsToGive: [{ assetId: OTHER_ASSET_ID, appId: CS_APP_ID }] });

        it("Should reject it", () => {
            const verdict = policy().verify(askingOffer());

            expect(verdict.getReasons()).toContain(OfferRejectionReason.ASKS_FOR_OUR_ITEMS);
        });

        it("Should ask to cancel it", () => {
            const verdict = policy().verify(askingOffer());

            expect(verdict.shouldBeCancelled()).toBe(true);
        });
    });

    it("Should not ask to cancel an offer that only carries the wrong item", () => {
        const verdict = policy().verify(receivedOffer({ itemsToReceive: [] }));

        expect(verdict.shouldBeCancelled()).toBe(false);
    });

    it.each([
        { scenario: "is missing the expected item", items: [] },
        { scenario: "carries another asset", items: [{ assetId: OTHER_ASSET_ID, appId: CS_APP_ID }] },
        { scenario: "carries the asset of another app", items: [{ ...expectedOfferItem, appId: OTHER_APP_ID }] },
        {
            scenario: "carries an extra item",
            items: [expectedOfferItem, { assetId: OTHER_ASSET_ID, appId: CS_APP_ID }],
        },
        { scenario: "carries the expected item twice", items: [expectedOfferItem, expectedOfferItem] },
    ])("Should reject an offer that $scenario", ({ items }) => {
        const verdict = policy().verify(receivedOffer({ itemsToReceive: items }));

        expect(verdict.getReasons()).toEqual([OfferRejectionReason.WRONG_ITEMS]);
    });

    describe("Scam: a look-alike offer from another account", () => {
        it("Should reject it when the seller is known", () => {
            const verdict = policy().verify(receivedOffer({ partnerSteamId: OTHER_STEAM_ID }));

            expect(verdict.getReasons()).toEqual([OfferRejectionReason.UNEXPECTED_PARTNER]);
        });

        it("Should not judge the partner when the seller is unknown", () => {
            const verdict = policy(false).verify(receivedOffer({ partnerSteamId: OTHER_STEAM_ID }));

            expect(verdict.isAccepted()).toBe(true);
        });
    });

    it("Should reject an offer with a trade hold", () => {
        const verdict = policy().verify(receivedOffer({ escrowDays: HOLD_DAYS }));

        expect(verdict.getReasons()).toEqual([OfferRejectionReason.TRADE_HOLD]);
    });

    it("Should reject an offer that is not active", () => {
        const verdict = policy().verify(receivedOffer({ isActive: false }));

        expect(verdict.getReasons()).toEqual([OfferRejectionReason.NOT_ACTIVE]);
    });

    it("Should reject a glitched offer", () => {
        const verdict = policy().verify(receivedOffer({ isGlitched: true }));

        expect(verdict.getReasons()).toEqual([OfferRejectionReason.GLITCHED]);
    });

    it("Should give every reason an offer fails", () => {
        const verdict = policy().verify(
            receivedOffer({ partnerSteamId: OTHER_STEAM_ID, isGlitched: true, itemsToReceive: [] }),
        );

        expect(verdict.getReasons()).toEqual([
            OfferRejectionReason.WRONG_ITEMS,
            OfferRejectionReason.UNEXPECTED_PARTNER,
            OfferRejectionReason.GLITCHED,
        ]);
    });
});
