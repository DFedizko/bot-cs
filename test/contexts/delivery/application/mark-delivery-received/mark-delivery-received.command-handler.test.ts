import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CSG_DELIVERY_HTTP, MARK_RECEIVED_HANDLER } from "@/contexts/delivery/external/di/delivery.identifiers";
import { MarkDeliveryReceivedCommand } from "@/contexts/delivery/application/mark-delivery-received/mark-delivery-received.command";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { DeliveryNotFoundError } from "@/contexts/delivery/domain/delivery/errors/delivery-not-found.error";
import { DeliveryReceivedEvent } from "@/contexts/delivery/domain/delivery/events/delivery-received.event";
import {
    acceptedDelivery,
    confirmedDelivery,
    receivedDelivery,
    TRADE_ID,
    TRADE_OFFER_ID,
} from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";
import { givenDelivery, publishedNames } from "../__builders__/delivery-scenario.builder";

const markDeliveryReceived = (container: Container): Promise<void> =>
    container.get(MARK_RECEIVED_HANDLER).handle(new MarkDeliveryReceivedCommand(TRADE_ID));

const EMPIRE_DOWN = "HTTP error 503";

let container: Container;

describe("MarkDeliveryReceivedCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should mark the trade offer as received on csgoempire", async () => {
        await givenDelivery(container, { tracked: confirmedDelivery(OFFER_ID) });
        const markSpy = jest.spyOn(container.get(CSG_DELIVERY_HTTP), "markAsReceived");

        await markDeliveryReceived(container);

        expect(markSpy).toHaveBeenCalledWith({ tradeoffer_id: TRADE_OFFER_ID });
    });

    it("Should record the delivery as received", async () => {
        const tracked = await givenDelivery(container, { tracked: confirmedDelivery(OFFER_ID) });

        await markDeliveryReceived(container);

        expect(tracked.getStatus()).toBe(DeliveryStatus.RECEIVED);
    });

    it("Should publish the delivery received event", async () => {
        await givenDelivery(container, { tracked: confirmedDelivery(OFFER_ID) });
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await markDeliveryReceived(container);

        expect(publishedNames(publishSpy)).toEqual([DeliveryReceivedEvent.EVENT_NAME]);
    });

    it("Should log the received delivery", async () => {
        await givenDelivery(container, { tracked: confirmedDelivery(OFFER_ID) });
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

        await markDeliveryReceived(container);

        expect(loggerSpy).toHaveBeenCalledWith(`Marked trade "${TRADE_ID}" as received`);
    });

    it("Should mark as received on a second run after a failed one", async () => {
        const tracked = await givenDelivery(container, { tracked: confirmedDelivery(OFFER_ID) });
        jest.spyOn(container.get(CSG_DELIVERY_HTTP), "markAsReceived").mockRejectedValueOnce(new Error(EMPIRE_DOWN));
        await expect(markDeliveryReceived(container)).rejects.toThrow(EMPIRE_DOWN);

        await markDeliveryReceived(container);

        expect(tracked.getStatus()).toBe(DeliveryStatus.RECEIVED);
    });

    it.each([
        { status: "not confirmed yet", build: () => acceptedDelivery(OFFER_ID, true) },
        { status: "already received", build: () => receivedDelivery(OFFER_ID) },
    ])("Should not mark a delivery $status", async ({ build }) => {
        await givenDelivery(container, { tracked: build() });
        const markSpy = jest.spyOn(container.get(CSG_DELIVERY_HTTP), "markAsReceived");

        await markDeliveryReceived(container);

        expect(markSpy).not.toHaveBeenCalled();
    });

    it("Should fail for an unknown delivery", async () => {
        await expect(markDeliveryReceived(container)).rejects.toThrow(DeliveryNotFoundError);
    });
});
