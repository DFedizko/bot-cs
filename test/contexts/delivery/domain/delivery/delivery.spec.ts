import { Delivery } from "@/contexts/delivery/domain/delivery/delivery";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { InvalidDeliveryTransitionError } from "@/contexts/delivery/domain/delivery/errors/invalid-delivery-transition.error";
import { DomainError } from "@/packages/error/domain-error";
import { ACCOUNT_ID, ASSET_ID, delivery, deliveryProps, MARKET_NAME, TRADE_ID } from "../__builders__/delivery.builder";
import { OFFER_ID } from "../__builders__/received-offer.builder";

const confirmedDelivery = (): Delivery => {
    const confirmed = delivery();
    confirmed.acceptOffer(OFFER_ID);
    confirmed.confirm();
    return confirmed;
};

describe("Delivery", () => {
    describe("start", () => {
        it("Should start awaiting the trade offer", () => {
            const started = delivery();

            expect(started.getStatus()).toBe(DeliveryStatus.AWAITING_OFFER);
        });

        it("Should keep the trade, account and expected item", () => {
            const started = delivery();

            expect(started.toPrimitives()).toMatchObject({
                tradeId: TRADE_ID,
                accountId: ACCOUNT_ID,
                expectedItem: { assetId: ASSET_ID, marketName: MARKET_NAME },
            });
        });

        it("Should start without a seller when the marketplace hides it", () => {
            const started = delivery({ sellerSteamId: undefined });

            expect(started.getSellerSteamId()).toBeUndefined();
        });

        it("Should reject a seller steam id that isn't a steam id 64", () => {
            const start = () => delivery({ sellerSteamId: "seller" });

            expect(start).toThrow(DomainError);
        });

        it("Should reject an empty asset id", () => {
            const start = () =>
                Delivery.start(deliveryProps({ expectedItem: { assetId: " ", marketName: MARKET_NAME, appId: 730 } }));

            expect(start).toThrow(DomainError);
        });
    });

    describe("acceptOffer", () => {
        it("Should record the accepted offer", () => {
            const awaiting = delivery();

            awaiting.acceptOffer(OFFER_ID);

            expect(awaiting.toPrimitives()).toMatchObject({
                status: DeliveryStatus.OFFER_ACCEPTED,
                acceptedOfferId: OFFER_ID,
            });
        });

        it("Should accept a late offer while disputed", () => {
            const disputed = delivery();
            disputed.dispute();

            disputed.acceptOffer(OFFER_ID);

            expect(disputed.getStatus()).toBe(DeliveryStatus.OFFER_ACCEPTED);
        });

        it("Should never accept a second offer", () => {
            const accepted = delivery();
            accepted.acceptOffer(OFFER_ID);

            expect(() => accepted.acceptOffer(OFFER_ID)).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("confirm", () => {
        it("Should confirm an accepted offer", () => {
            const accepted = delivery();
            accepted.acceptOffer(OFFER_ID);

            accepted.confirm();

            expect(accepted.getStatus()).toBe(DeliveryStatus.CONFIRMED);
        });

        it("Should not confirm before an offer was accepted", () => {
            const awaiting = delivery();

            expect(() => awaiting.confirm()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("markReceived", () => {
        it("Should be received once confirmed", () => {
            const confirmed = confirmedDelivery();

            confirmed.markReceived();

            expect(confirmed.getStatus()).toBe(DeliveryStatus.RECEIVED);
        });

        it("Should not be received before the offer was confirmed", () => {
            const accepted = delivery();
            accepted.acceptOffer(OFFER_ID);

            expect(() => accepted.markReceived()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("dispute", () => {
        it("Should dispute a delivery still awaiting its offer", () => {
            const awaiting = delivery();

            awaiting.dispute();

            expect(awaiting.getStatus()).toBe(DeliveryStatus.DISPUTED);
        });

        it("Should not dispute a delivery whose offer was accepted", () => {
            const confirmed = confirmedDelivery();

            expect(() => confirmed.dispute()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("fail", () => {
        it("Should fail an accepted offer that went on hold", () => {
            const accepted = delivery();
            accepted.acceptOffer(OFFER_ID);

            accepted.fail();

            expect(accepted.getStatus()).toBe(DeliveryStatus.FAILED);
        });

        it("Should not fail a received delivery", () => {
            const received = confirmedDelivery();
            received.markReceived();

            expect(() => received.fail()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("cancel", () => {
        it("Should cancel a delivery awaiting its offer", () => {
            const awaiting = delivery();

            awaiting.cancel();

            expect(awaiting.getStatus()).toBe(DeliveryStatus.CANCELLED);
        });

        it("Should not cancel a confirmed delivery", () => {
            const confirmed = confirmedDelivery();

            expect(() => confirmed.cancel()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("canTakeOffers", () => {
        it.each([
            { status: "awaiting", build: () => delivery(), expected: true },
            { status: "confirmed", build: confirmedDelivery, expected: false },
        ])("Should be $expected when $status", ({ build, expected }) => {
            const subject = build();

            expect(subject.canTakeOffers()).toBe(expected);
        });
    });

    describe("canBeDisputed", () => {
        it.each([
            { status: "awaiting", build: () => delivery(), expected: true },
            { status: "confirmed", build: confirmedDelivery, expected: false },
        ])("Should be $expected when $status", ({ build, expected }) => {
            const subject = build();

            expect(subject.canBeDisputed()).toBe(expected);
        });
    });
});
