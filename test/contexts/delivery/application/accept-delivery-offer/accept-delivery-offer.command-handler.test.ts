import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CSGOEMPIRE_DELIVERY_HTTP } from "@/contexts/delivery/external/di/delivery.identifiers";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { DeliveryNotFoundError } from "@/contexts/delivery/domain/delivery/errors/delivery-not-found.error";
import { TradeOfferAcceptedEvent } from "@/contexts/delivery/application/accept-delivery-offer/trade-offer-accepted.event";
import { DeliveryReceivedEvent } from "@/contexts/delivery/application/accept-delivery-offer/delivery-received.event";
import { TradeOfferCancelledEvent } from "@/contexts/delivery/application/accept-delivery-offer/trade-offer-cancelled.event";
import { DeliveryOfferNotFoundEvent } from "@/contexts/delivery/application/accept-delivery-offer/delivery-offer-not-found.event";
import { DeliveryFailedEvent } from "@/contexts/delivery/application/accept-delivery-offer/delivery-failed.event";
import {
    ACCOUNT_ID,
    delivery,
    TRADE_ID,
    TRADE_OFFER_ID,
} from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID, OTHER_STEAM_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";
import {
    OTHER_OFFER_ID,
    scamOfferAskingOurItems,
    steamEconItem,
    steamTradeOffer,
} from "../../external/steam/__mocks__/steam-trade-offer.mock";
import { acceptDeliveryOffer, givenDelivery, steamSession } from "./__builders__/accept-offer-scenario.builder";

const HOLD_DAYS = 15;
const WRONG_ASSET_ID = "11111111111";

const publishedNames = (spy: { mock: { calls: unknown[][] } }): string[] =>
    spy.mock.calls.flatMap(([events]) => (events as { name: string }[]).map((event) => event.name));

let container: Container;

describe("AcceptDeliveryOfferCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    describe("When exactly one offer matches", () => {
        it("Should accept the matching offer on steam", async () => {
            await givenDelivery(container);
            const acceptSpy = jest.spyOn(steamSession(container), "acceptOffer");

            await acceptDeliveryOffer(container);

            expect(acceptSpy).toHaveBeenCalledWith(OFFER_ID);
        });

        it("Should mark the trade as received on csgoempire", async () => {
            await givenDelivery(container);
            const markSpy = jest.spyOn(container.get(CSGOEMPIRE_DELIVERY_HTTP), "markAsReceived");

            await acceptDeliveryOffer(container);

            expect(markSpy).toHaveBeenCalledWith({ tradeoffer_id: TRADE_OFFER_ID });
        });

        it("Should record the delivery as received", async () => {
            const tracked = await givenDelivery(container);

            await acceptDeliveryOffer(container);

            expect(tracked.toPrimitives()).toMatchObject({
                status: DeliveryStatus.RECEIVED,
                acceptedOfferId: OFFER_ID,
            });
        });

        it("Should publish the accepted offer and the received delivery", async () => {
            await givenDelivery(container);
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await acceptDeliveryOffer(container);

            expect(publishedNames(publishSpy)).toEqual([
                TradeOfferAcceptedEvent.EVENT_NAME,
                DeliveryReceivedEvent.EVENT_NAME,
            ]);
        });

        it("Should confirm the offer with the mobile authenticator when steam asks", async () => {
            await givenDelivery(container, { steam: { confirmationRequired: true } });
            const confirmSpy = jest.spyOn(steamSession(container), "confirmOffer");

            await acceptDeliveryOffer(container);

            expect(confirmSpy).toHaveBeenCalledWith(OFFER_ID);
        });

        it("Should not ask for a confirmation steam doesn't need", async () => {
            await givenDelivery(container);
            const confirmSpy = jest.spyOn(steamSession(container), "confirmOffer");

            await acceptDeliveryOffer(container);

            expect(confirmSpy).not.toHaveBeenCalled();
        });

        it("Should log the accepted offer", async () => {
            await givenDelivery(container);
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

            await acceptDeliveryOffer(container);

            expect(loggerSpy).toHaveBeenCalledWith(
                `Accepted offer "${OFFER_ID}" for trade "${TRADE_ID}" of account "${ACCOUNT_ID}"`,
            );
        });
    });

    describe("Scam offers", () => {
        it("Should cancel an offer that asks for our items", async () => {
            await givenDelivery(container, { offers: [scamOfferAskingOurItems()] });
            const cancelSpy = jest.spyOn(steamSession(container), "cancelOffer");

            await acceptDeliveryOffer(container);

            expect(cancelSpy).toHaveBeenCalledWith(OTHER_OFFER_ID);
        });

        it("Should never accept an offer that asks for our items", async () => {
            await givenDelivery(container, { offers: [scamOfferAskingOurItems()] });
            const acceptSpy = jest.spyOn(steamSession(container), "acceptOffer");

            await acceptDeliveryOffer(container);

            expect(acceptSpy).not.toHaveBeenCalled();
        });

        it("Should publish the cancelled offer with its reason", async () => {
            await givenDelivery(container, { offers: [scamOfferAskingOurItems()] });
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await acceptDeliveryOffer(container);

            const [[event]] = publishSpy.mock.calls[0];
            expect(event).toMatchObject({
                name: TradeOfferCancelledEvent.EVENT_NAME,
                payload: { tradeId: TRADE_ID, offerId: OTHER_OFFER_ID, reasons: ["asks_for_our_items"] },
            });
        });

        it("Should still accept the right offer next to a scam", async () => {
            const tracked = await givenDelivery(container, { offers: [scamOfferAskingOurItems(), steamTradeOffer()] });

            await acceptDeliveryOffer(container);

            expect(tracked.getStatus()).toBe(DeliveryStatus.RECEIVED);
        });

        it("Should ignore a look-alike offer from another account", async () => {
            const tracked = await givenDelivery(container, { offers: [steamTradeOffer({ partner: OTHER_STEAM_ID })] });

            await acceptDeliveryOffer(container);

            expect(tracked.getStatus()).toBe(DeliveryStatus.AWAITING_OFFER);
        });

        it("Should log why it rejected an offer", async () => {
            await givenDelivery(container, { offers: [steamTradeOffer({ partner: OTHER_STEAM_ID })] });
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

            await acceptDeliveryOffer(container);

            expect(loggerSpy).toHaveBeenCalledWith(
                `Rejected offer "${OFFER_ID}" for trade "${TRADE_ID}": unexpected_partner`,
            );
        });
    });

    describe("When no single offer matches", () => {
        it.each([
            { scenario: "no offer arrived", offers: [], matchingOffers: 0 },
            {
                scenario: "only the wrong item arrived",
                offers: [steamTradeOffer({ itemsToReceive: [steamEconItem({ assetid: WRONG_ASSET_ID })] })],
                matchingOffers: 0,
            },
            {
                scenario: "two offers match",
                offers: [steamTradeOffer(), steamTradeOffer({ id: OTHER_OFFER_ID })],
                matchingOffers: 2,
            },
        ])("Should accept nothing and say so when $scenario", async ({ offers, matchingOffers }) => {
            await givenDelivery(container, { offers });
            const acceptSpy = jest.spyOn(steamSession(container), "acceptOffer");
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await acceptDeliveryOffer(container);

            expect(acceptSpy).not.toHaveBeenCalled();
            expect(publishSpy).toHaveBeenCalledWith([
                expect.objectContaining({
                    name: DeliveryOfferNotFoundEvent.EVENT_NAME,
                    payload: { tradeId: TRADE_ID, accountId: ACCOUNT_ID, matchingOffers },
                }),
            ]);
        });
    });

    describe("When steam puts the accepted offer on hold", () => {
        it("Should fail the delivery without marking it received", async () => {
            const tracked = await givenDelivery(container);
            jest.spyOn(steamSession(container), "acceptOffer").mockResolvedValue("escrow");
            const markSpy = jest.spyOn(container.get(CSGOEMPIRE_DELIVERY_HTTP), "markAsReceived");

            await acceptDeliveryOffer(container);

            expect(tracked.getStatus()).toBe(DeliveryStatus.FAILED);
            expect(markSpy).not.toHaveBeenCalled();
        });

        it("Should publish the failed delivery", async () => {
            await givenDelivery(container, { offers: [steamTradeOffer()] });
            jest.spyOn(steamSession(container), "acceptOffer").mockResolvedValue("escrow");
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await acceptDeliveryOffer(container);

            expect(publishedNames(publishSpy)).toEqual([DeliveryFailedEvent.EVENT_NAME]);
        });
    });

    describe("Resuming after a failure", () => {
        it("Should only confirm an offer it accepted but couldn't confirm", async () => {
            const accepted = delivery();
            accepted.acceptOffer(OFFER_ID);
            await givenDelivery(container, { tracked: accepted, steam: { confirmationRequired: true } });
            await steamSession(container).acceptOffer(OFFER_ID);
            const confirmSpy = jest.spyOn(steamSession(container), "confirmOffer");

            await acceptDeliveryOffer(container);

            expect(confirmSpy).toHaveBeenCalledWith(OFFER_ID);
        });

        it("Should only mark as received a delivery already confirmed", async () => {
            const confirmed = delivery();
            confirmed.acceptOffer(OFFER_ID);
            confirmed.confirm();
            await givenDelivery(container, { tracked: confirmed });
            const listSpy = jest.spyOn(steamSession(container), "getReceivedActiveOffers");

            await acceptDeliveryOffer(container);

            expect(listSpy).not.toHaveBeenCalled();
            expect(confirmed.getStatus()).toBe(DeliveryStatus.RECEIVED);
        });

        it("Should do nothing for a delivery already received", async () => {
            const received = delivery();
            received.acceptOffer(OFFER_ID);
            received.confirm();
            received.markReceived();
            await givenDelivery(container, { tracked: received });
            const markSpy = jest.spyOn(container.get(CSGOEMPIRE_DELIVERY_HTTP), "markAsReceived");

            await acceptDeliveryOffer(container);

            expect(markSpy).not.toHaveBeenCalled();
        });
    });

    it("Should fail for an unknown delivery", async () => {
        await expect(acceptDeliveryOffer(container)).rejects.toThrow(DeliveryNotFoundError);
    });
});
