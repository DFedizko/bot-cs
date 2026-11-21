import { Delivery } from "@/contexts/delivery/domain/delivery/delivery";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { DeliveryFailureReason } from "@/contexts/delivery/domain/delivery/delivery-failure-reason";
import { InvalidDeliveryTransitionError } from "@/contexts/delivery/domain/delivery/errors/invalid-delivery-transition.error";
import { DeliveryStartedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-started.event";
import { TradeOfferAcceptedEvent } from "@/contexts/delivery/domain/delivery/events/trade-offer-accepted.event";
import { DeliveryConfirmedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-confirmed.event";
import { DeliveryReceivedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-received.event";
import { DeliveryDisputedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-disputed.event";
import { DeliveryFailedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-failed.event";
import { DeliveryCancelledEvent } from "@/contexts/delivery/domain/delivery/events/delivery-cancelled.event";
import { DomainError } from "@/packages/error/domain-error";
import {
    acceptedDelivery,
    ACCOUNT_ID,
    ASSET_ID,
    awaitingDelivery,
    confirmedDelivery,
    delivery,
    deliveryProps,
    MARKET_NAME,
    receivedDelivery,
    TRADE_ID,
    TRADE_OFFER_ID,
} from "../__builders__/delivery.builder";
import { OFFER_ID } from "../__builders__/received-offer.builder";

const NEEDS_CONFIRMATION = true;
const IDENTITY = { tradeId: TRADE_ID, tradeOfferId: TRADE_OFFER_ID, accountId: ACCOUNT_ID };

const awaiting = (): Delivery => awaitingDelivery();
const accepted = (needsConfirmation = NEEDS_CONFIRMATION): Delivery => acceptedDelivery(OFFER_ID, needsConfirmation);
const confirmed = (): Delivery => confirmedDelivery(OFFER_ID);
const received = (): Delivery => receivedDelivery(OFFER_ID);

describe("Delivery", () => {
    describe("start", () => {
        it("Should start awaiting the trade offer", () => {
            expect(delivery().getStatus()).toBe(DeliveryStatus.AWAITING_OFFER);
        });

        it("Should keep the trade, account and expected item", () => {
            expect(delivery().toPrimitives()).toMatchObject({
                ...IDENTITY,
                expectedItem: { assetId: ASSET_ID, marketName: MARKET_NAME },
            });
        });

        it("Should record that the delivery started", () => {
            const [event] = delivery().pullDomainEvents();

            expect(event).toBeInstanceOf(DeliveryStartedEvent);
            expect(event.payload).toEqual(IDENTITY);
        });

        it("Should start without a seller when the marketplace hides it", () => {
            expect(delivery({ sellerSteamId: undefined }).getSellerSteamId()).toBeUndefined();
        });

        it("Should reject a seller steam id that isn't a steam id 64", () => {
            expect(() => delivery({ sellerSteamId: "seller" })).toThrow(DomainError);
        });

        it("Should reject an empty asset id", () => {
            const start = () =>
                Delivery.start(deliveryProps({ expectedItem: { assetId: " ", marketName: MARKET_NAME, appId: 730 } }));

            expect(start).toThrow(DomainError);
        });
    });

    describe("acceptOffer", () => {
        it("Should record the accepted offer and whether it needs a confirmation", () => {
            const subject = awaiting();

            subject.acceptOffer(OFFER_ID, NEEDS_CONFIRMATION);

            expect(subject.toPrimitives()).toMatchObject({
                status: DeliveryStatus.OFFER_ACCEPTED,
                acceptedOfferId: OFFER_ID,
                needsConfirmation: NEEDS_CONFIRMATION,
            });
        });

        it("Should record a trade offer accepted event", () => {
            const subject = awaiting();
            subject.acceptOffer(OFFER_ID, NEEDS_CONFIRMATION);

            const [event] = subject.pullDomainEvents();

            expect(event).toBeInstanceOf(TradeOfferAcceptedEvent);
            expect(event.payload).toEqual({ ...IDENTITY, offerId: OFFER_ID, needsConfirmation: NEEDS_CONFIRMATION });
        });

        it("Should accept a late offer while disputed", () => {
            const disputed = awaiting();
            disputed.dispute();

            disputed.acceptOffer(OFFER_ID, NEEDS_CONFIRMATION);

            expect(disputed.getStatus()).toBe(DeliveryStatus.OFFER_ACCEPTED);
        });

        it("Should never accept a second offer", () => {
            expect(() => accepted().acceptOffer(OFFER_ID, NEEDS_CONFIRMATION)).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("holdOffer", () => {
        it("Should fail the delivery when the accepted offer went on hold", () => {
            const subject = awaiting();

            subject.holdOffer(OFFER_ID);

            expect(subject.getStatus()).toBe(DeliveryStatus.FAILED);
        });

        it("Should record why the delivery failed", () => {
            const subject = awaiting();
            subject.holdOffer(OFFER_ID);

            const [event] = subject.pullDomainEvents();

            expect(event).toBeInstanceOf(DeliveryFailedEvent);
            expect(event.payload).toEqual({ ...IDENTITY, offerId: OFFER_ID, reason: DeliveryFailureReason.TRADE_HOLD });
        });
    });

    describe("confirm", () => {
        it("Should confirm an accepted offer and record it", () => {
            const subject = accepted();
            subject.confirm();

            const [event] = subject.pullDomainEvents();

            expect(subject.getStatus()).toBe(DeliveryStatus.CONFIRMED);
            expect(event).toBeInstanceOf(DeliveryConfirmedEvent);
            expect(event.payload).toEqual({ ...IDENTITY, offerId: OFFER_ID });
        });

        it("Should not confirm before an offer was accepted", () => {
            expect(() => awaiting().confirm()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("markReceived", () => {
        it("Should be received once confirmed and record it", () => {
            const subject = confirmed();
            subject.markReceived();

            const [event] = subject.pullDomainEvents();

            expect(subject.getStatus()).toBe(DeliveryStatus.RECEIVED);
            expect(event).toBeInstanceOf(DeliveryReceivedEvent);
            expect(event.payload).toEqual({ ...IDENTITY, offerId: OFFER_ID });
        });

        it("Should not be received before the offer was confirmed", () => {
            expect(() => accepted().markReceived()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("dispute", () => {
        it("Should dispute a delivery still awaiting its offer and record it", () => {
            const subject = awaiting();
            subject.dispute();

            const [event] = subject.pullDomainEvents();

            expect(subject.getStatus()).toBe(DeliveryStatus.DISPUTED);
            expect(event).toBeInstanceOf(DeliveryDisputedEvent);
            expect(event.payload).toEqual(IDENTITY);
        });

        it("Should not dispute a delivery whose offer was accepted", () => {
            expect(() => confirmed().dispute()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("fail", () => {
        it("Should not fail a received delivery", () => {
            expect(() => received().fail(DeliveryFailureReason.TRADE_HOLD)).toThrow(InvalidDeliveryTransitionError);
        });
    });

    describe("cancel", () => {
        it("Should cancel a delivery awaiting its offer and record it", () => {
            const subject = awaiting();
            subject.cancel();

            const [event] = subject.pullDomainEvents();

            expect(subject.getStatus()).toBe(DeliveryStatus.CANCELLED);
            expect(event).toBeInstanceOf(DeliveryCancelledEvent);
        });

        it("Should not cancel a confirmed delivery", () => {
            expect(() => confirmed().cancel()).toThrow(InvalidDeliveryTransitionError);
        });
    });

    it("Should not record anything when a transition is refused", () => {
        const subject = confirmed();

        expect(() => subject.dispute()).toThrow(InvalidDeliveryTransitionError);
        expect(subject.pullDomainEvents()).toEqual([]);
    });

    describe.each([
        { query: "canTakeOffers", build: awaiting, expected: true },
        { query: "canTakeOffers", build: confirmed, expected: false },
        { query: "isAwaitingOffer", build: awaiting, expected: true },
        { query: "isAwaitingOffer", build: accepted, expected: false },
        { query: "canBeDisputed", build: awaiting, expected: true },
        { query: "canBeDisputed", build: confirmed, expected: false },
        { query: "canBeConfirmed", build: accepted, expected: true },
        { query: "canBeConfirmed", build: confirmed, expected: false },
        { query: "canBeMarkedReceived", build: confirmed, expected: true },
        { query: "canBeMarkedReceived", build: received, expected: false },
        { query: "needsConfirmation", build: () => accepted(true), expected: true },
        { query: "needsConfirmation", build: () => accepted(false), expected: false },
    ] as const)("$query", ({ query, build, expected }) => {
        it(`Should be ${expected}`, () => {
            expect(build()[query]()).toBe(expected);
        });
    });
});
