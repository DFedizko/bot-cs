import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { STOP_TRACKING_HANDLER } from "@/contexts/delivery/external/di/delivery.identifiers";
import { StopDeliveryTrackingCommand } from "@/contexts/delivery/application/stop-delivery-tracking/stop-delivery-tracking.command";
import { DeliveryTrackingStoppedEvent } from "@/contexts/delivery/application/stop-delivery-tracking/delivery-tracking-stopped.event";
import { ACCOUNT_ID, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { fakeScheduler, SECOND_ACCOUNT_ID, startTracking, trackedDelivery } from "../../__builders__/tracking.builder";

const REASON = "delivery_received";

const stopCommand = (accountId = ACCOUNT_ID) =>
    new StopDeliveryTrackingCommand({ tradeId: TRADE_ID, accountId, reason: REASON });

let container: Container;

describe("StopDeliveryTrackingCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should stop checking the delivery's offers", async () => {
        startTracking(container);

        await container.get(STOP_TRACKING_HANDLER).handle(stopCommand());

        expect(fakeScheduler(container).activeIntervals()).toEqual([]);
    });

    it("Should publish that the tracking stopped", async () => {
        startTracking(container);
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(STOP_TRACKING_HANDLER).handle(stopCommand());

        expect(publishSpy).toHaveBeenCalledWith([
            expect.objectContaining({
                name: DeliveryTrackingStoppedEvent.EVENT_NAME,
                payload: { tradeId: TRADE_ID, accountId: ACCOUNT_ID, reason: REASON },
            }),
        ]);
    });

    it("Should publish nothing when the delivery was not tracked", async () => {
        const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

        await container.get(STOP_TRACKING_HANDLER).handle(stopCommand());

        expect(publishSpy).not.toHaveBeenCalled();
    });

    it("Should leave the tracker of another account running", async () => {
        startTracking(container, trackedDelivery({ accountId: SECOND_ACCOUNT_ID }));

        await container.get(STOP_TRACKING_HANDLER).handle(stopCommand());

        expect(fakeScheduler(container).activeIntervals()).toHaveLength(1);
    });
});
