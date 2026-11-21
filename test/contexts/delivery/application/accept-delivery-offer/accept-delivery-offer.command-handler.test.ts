import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { ACCEPT_OFFER_HANDLER } from "@/contexts/delivery/external/di/delivery.identifiers";
import { AcceptDeliveryOfferCommand } from "@/contexts/delivery/application/accept-delivery-offer/accept-delivery-offer.command";
import { DeliveryOfferNotFoundEvent } from "@/contexts/delivery/application/accept-delivery-offer/delivery-offer-not-found.event";
import { ScamOfferFoundEvent } from "@/contexts/delivery/application/accept-delivery-offer/scam-offer-found.event";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { DeliveryNotFoundError } from "@/contexts/delivery/domain/delivery/errors/delivery-not-found.error";
import { TradeOfferAcceptedEvent } from "@/contexts/delivery/domain/delivery/events/trade-offer-accepted.event";
import { DeliveryFailedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-failed.event";
import {
    ACCOUNT_ID,
    acceptedDelivery,
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
import { givenDelivery, publishedNames, steamSession } from "../__builders__/delivery-scenario.builder";

const WRONG_ASSET_ID = "11111111111";

const acceptDeliveryOffer = (container: Container): Promise<void> =>
    container.get(ACCEPT_OFFER_HANDLER).handle(new AcceptDeliveryOfferCommand(TRADE_ID));

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

        it("Should record the accepted offer on the delivery", async () => {
            const tracked = await givenDelivery(container);

            await acceptDeliveryOffer(container);

            expect(tracked.toPrimitives()).toMatchObject({
                status: DeliveryStatus.OFFER_ACCEPTED,
                acceptedOfferId: OFFER_ID,
            });
        });

        it("Should publish the trade offer accepted event the delivery recorded", async () => {
            await givenDelivery(container, { steam: { confirmationRequired: true } });
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await acceptDeliveryOffer(container);

            expect(publishSpy).toHaveBeenCalledWith([
                expect.objectContaining({
                    name: TradeOfferAcceptedEvent.EVENT_NAME,
                    payload: {
                        tradeId: TRADE_ID,
                        tradeOfferId: TRADE_OFFER_ID,
                        accountId: ACCOUNT_ID,
                        offerId: OFFER_ID,
                        needsConfirmation: true,
                    },
                }),
            ]);
        });

        it("Should leave confirming and marking received to other commands", async () => {
            await givenDelivery(container, { steam: { confirmationRequired: true } });
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
        it("Should never accept an offer that asks for our items", async () => {
            await givenDelivery(container, { offers: [scamOfferAskingOurItems()] });
            const acceptSpy = jest.spyOn(steamSession(container), "acceptOffer");

            await acceptDeliveryOffer(container);

            expect(acceptSpy).not.toHaveBeenCalled();
        });

        it("Should report the scam offer so it gets cancelled", async () => {
            await givenDelivery(container, { offers: [scamOfferAskingOurItems()] });
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await acceptDeliveryOffer(container);

            expect(publishSpy).toHaveBeenCalledWith([
                expect.objectContaining({
                    name: ScamOfferFoundEvent.EVENT_NAME,
                    payload: {
                        tradeId: TRADE_ID,
                        accountId: ACCOUNT_ID,
                        offerId: OTHER_OFFER_ID,
                        reasons: ["asks_for_our_items"],
                    },
                }),
            ]);
        });

        it("Should still accept the right offer next to a scam", async () => {
            const tracked = await givenDelivery(container, { offers: [scamOfferAskingOurItems(), steamTradeOffer()] });

            await acceptDeliveryOffer(container);

            expect(tracked.getStatus()).toBe(DeliveryStatus.OFFER_ACCEPTED);
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
        it("Should fail the delivery", async () => {
            const tracked = await givenDelivery(container);
            jest.spyOn(steamSession(container), "acceptOffer").mockResolvedValue("escrow");

            await acceptDeliveryOffer(container);

            expect(tracked.getStatus()).toBe(DeliveryStatus.FAILED);
        });

        it("Should publish only the failed delivery", async () => {
            await givenDelivery(container);
            jest.spyOn(steamSession(container), "acceptOffer").mockResolvedValue("escrow");
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await acceptDeliveryOffer(container);

            expect(publishedNames(publishSpy)).toEqual([DeliveryFailedEvent.EVENT_NAME]);
        });
    });

    it("Should do nothing for a delivery whose offer was already accepted", async () => {
        await givenDelivery(container, { tracked: acceptedDelivery(OFFER_ID, false) });
        const listSpy = jest.spyOn(steamSession(container), "getReceivedActiveOffers");

        await acceptDeliveryOffer(container);

        expect(listSpy).not.toHaveBeenCalled();
    });

    it("Should fail for an unknown delivery", async () => {
        await expect(acceptDeliveryOffer(container)).rejects.toThrow(DeliveryNotFoundError);
    });
});
