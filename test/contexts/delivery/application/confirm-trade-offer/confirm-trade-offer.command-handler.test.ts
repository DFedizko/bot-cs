import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CONFIRM_OFFER_HANDLER } from "@/contexts/delivery/external/di/delivery.identifiers";
import { ConfirmTradeOfferCommand } from "@/contexts/delivery/application/confirm-trade-offer/confirm-trade-offer.command";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { DeliveryNotFoundError } from "@/contexts/delivery/domain/delivery/errors/delivery-not-found.error";
import { DeliveryConfirmedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-confirmed.event";
import {
    acceptedDelivery,
    awaitingDelivery,
    confirmedDelivery,
    TRADE_ID,
} from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";
import { givenDelivery, publishedNames, steamSession } from "../__builders__/delivery-scenario.builder";

const NEEDS_CONFIRMATION = true;
const NO_CONFIRMATION = false;

const confirmTradeOffer = (container: Container): Promise<void> =>
    container.get(CONFIRM_OFFER_HANDLER).handle(new ConfirmTradeOfferCommand(TRADE_ID));

const givenPendingOffer = async (container: Container) => {
    const tracked = await givenDelivery(container, {
        tracked: acceptedDelivery(OFFER_ID, NEEDS_CONFIRMATION),
        steam: { confirmationRequired: true },
    });
    await steamSession(container).acceptOffer(OFFER_ID);
    return tracked;
};

let container: Container;

describe("ConfirmTradeOfferCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should confirm the offer with the mobile authenticator when steam asks", async () => {
        await givenPendingOffer(container);
        const confirmSpy = jest.spyOn(steamSession(container), "confirmOffer");

        await confirmTradeOffer(container);

        expect(confirmSpy).toHaveBeenCalledWith(OFFER_ID);
    });

    it("Should not ask for a confirmation steam doesn't need", async () => {
        await givenDelivery(container, { tracked: acceptedDelivery(OFFER_ID, NO_CONFIRMATION) });
        const confirmSpy = jest.spyOn(steamSession(container), "confirmOffer");

        await confirmTradeOffer(container);

        expect(confirmSpy).not.toHaveBeenCalled();
    });

    it("Should record the delivery as confirmed", async () => {
        const tracked = await givenPendingOffer(container);

        await confirmTradeOffer(container);

        expect(tracked.getStatus()).toBe(DeliveryStatus.CONFIRMED);
    });

    it("Should publish the delivery confirmed event", async () => {
        await givenPendingOffer(container);
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await confirmTradeOffer(container);

        expect(publishedNames(publishSpy)).toEqual([DeliveryConfirmedEvent.EVENT_NAME]);
    });

    it("Should keep the offer accepted when the confirmation fails, so it can be retried", async () => {
        const tracked = await givenPendingOffer(container);
        jest.spyOn(steamSession(container), "confirmOffer").mockRejectedValue(new Error("HTTP error 500"));

        await expect(confirmTradeOffer(container)).rejects.toThrow();

        expect(tracked.getStatus()).toBe(DeliveryStatus.OFFER_ACCEPTED);
    });

    it.each([
        { status: "still awaiting its offer", build: () => awaitingDelivery() },
        { status: "already confirmed", build: () => confirmedDelivery(OFFER_ID) },
    ])("Should do nothing for a delivery $status", async ({ build }) => {
        await givenDelivery(container, { tracked: build() });
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await confirmTradeOffer(container);

        expect(publishSpy).not.toHaveBeenCalled();
    });

    it("Should fail for an unknown delivery", async () => {
        await expect(confirmTradeOffer(container)).rejects.toThrow(DeliveryNotFoundError);
    });
});
