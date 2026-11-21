import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CANCEL_OFFER_HANDLER } from "@/contexts/delivery/external/di/delivery.identifiers";
import { CancelTradeOfferCommand } from "@/contexts/delivery/application/cancel-trade-offer/cancel-trade-offer.command";
import { TradeOfferCancelledEvent } from "@/contexts/delivery/application/cancel-trade-offer/trade-offer-cancelled.event";
import { ACCOUNT_ID, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OTHER_OFFER_ID, scamOfferAskingOurItems } from "../../external/steam/__mocks__/steam-trade-offer.mock";
import { givenDelivery, steamSession } from "../__builders__/delivery-scenario.builder";

const REASONS = ["asks_for_our_items"];

const cancelTradeOffer = (container: Container): Promise<void> =>
    container.get(CANCEL_OFFER_HANDLER).handle(
        new CancelTradeOfferCommand({
            tradeId: TRADE_ID,
            accountId: ACCOUNT_ID,
            offerId: OTHER_OFFER_ID,
            reasons: REASONS,
        }),
    );

let container: Container;

describe("CancelTradeOfferCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should cancel the offer on steam", async () => {
        await givenDelivery(container, { offers: [scamOfferAskingOurItems()] });
        const cancelSpy = jest.spyOn(steamSession(container), "cancelOffer");

        await cancelTradeOffer(container);

        expect(cancelSpy).toHaveBeenCalledWith(OTHER_OFFER_ID);
    });

    it("Should publish the cancelled offer with its reasons", async () => {
        await givenDelivery(container, { offers: [scamOfferAskingOurItems()] });
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await cancelTradeOffer(container);

        expect(publishSpy).toHaveBeenCalledWith([
            expect.objectContaining({
                name: TradeOfferCancelledEvent.EVENT_NAME,
                payload: { tradeId: TRADE_ID, accountId: ACCOUNT_ID, offerId: OTHER_OFFER_ID, reasons: REASONS },
            }),
        ]);
    });

    it("Should log the cancelled offer", async () => {
        await givenDelivery(container, { offers: [scamOfferAskingOurItems()] });
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

        await cancelTradeOffer(container);

        expect(loggerSpy).toHaveBeenCalledWith(`Cancelled offer "${OTHER_OFFER_ID}": asks_for_our_items`);
    });
});
