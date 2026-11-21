import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import { DELIVERY_TRACKERS, TRACK_DELIVERY_HANDLER } from "@/contexts/delivery/external/di/delivery.identifiers";
import { TrackDeliveryCommand } from "@/contexts/delivery/application/track-delivery/track-delivery.command";
import { DeliveryNotFoundError } from "@/contexts/delivery/domain/delivery/errors/delivery-not-found.error";
import { acceptedDelivery, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { OFFER_ID } from "@/contexts/delivery/domain/__builders__/received-offer.builder";
import { givenDelivery } from "../__builders__/delivery-scenario.builder";
import { fakeScheduler, trackedDelivery } from "../../__builders__/tracking.builder";

let container: Container;

describe("TrackDeliveryCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should track a delivery awaiting its offer by account and trade", async () => {
        await givenDelivery(container);
        const trackSpy = jest.spyOn(container.get(DELIVERY_TRACKERS), "track");

        await container.get(TRACK_DELIVERY_HANDLER).handle(new TrackDeliveryCommand(TRADE_ID));

        expect(trackSpy).toHaveBeenCalledWith(trackedDelivery());
    });

    it("Should keep one tracker when the same delivery is tracked twice", async () => {
        await givenDelivery(container);
        const handler = container.get(TRACK_DELIVERY_HANDLER);
        await handler.handle(new TrackDeliveryCommand(TRADE_ID));

        await handler.handle(new TrackDeliveryCommand(TRADE_ID));

        expect(fakeScheduler(container).activeIntervals()).toHaveLength(1);
    });

    it("Should not track a delivery whose offer was already accepted", async () => {
        await givenDelivery(container, { tracked: acceptedDelivery(OFFER_ID, false) });

        await container.get(TRACK_DELIVERY_HANDLER).handle(new TrackDeliveryCommand(TRADE_ID));

        expect(fakeScheduler(container).activeIntervals()).toEqual([]);
    });

    it("Should log that the delivery is tracked", async () => {
        await givenDelivery(container);
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");

        await container.get(TRACK_DELIVERY_HANDLER).handle(new TrackDeliveryCommand(TRADE_ID));

        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining(`Tracking the offer of trade "${TRADE_ID}"`));
    });

    it("Should refuse to track an unknown delivery", async () => {
        const track = container.get(TRACK_DELIVERY_HANDLER).handle(new TrackDeliveryCommand(TRADE_ID));

        await expect(track).rejects.toThrow(DeliveryNotFoundError);
    });
});
