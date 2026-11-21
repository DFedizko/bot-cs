import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CSG_DELIVERY_HTTP,
    RECEIVED_OFFERS_GATEWAY,
    TRACKING_OPTIONS,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { DeliveryStatus } from "@/contexts/delivery/domain/delivery/delivery-status";
import { TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import { givenDelivery } from "../../application/__builders__/delivery-scenario.builder";
import {
    deliveryStatus,
    fakeClock,
    fakeScheduler,
    startTracking,
    trackedDelivery,
} from "../../__builders__/tracking.builder";

const DISPUTE_REFUSED = new Error("HTTP error 400");
const RATE_LIMITED = new Error("HTTP error 429 Too Many Requests");
const ONE_MS = 1;
const STEAM_DOWN = new Error("ECONNRESET");

let container: Container;

describe("DeliveryTracker", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    describe("when the max wait passes", () => {
        it("Should dispute the delivery", async () => {
            await givenDelivery(container, { offers: [] });
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect(await deliveryStatus(container)).toBe(DeliveryStatus.DISPUTED);
        });

        it("Should stop tracking the delivery", async () => {
            await givenDelivery(container, { offers: [] });
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect(fakeScheduler(container).activeIntervals()).toEqual([]);
        });

        it("Should stop tracking even when the dispute fails, so it is never retried forever", async () => {
            await givenDelivery(container, { offers: [] });
            jest.spyOn(container.get(CSG_DELIVERY_HTTP), "disputeTrade").mockRejectedValue(DISPUTE_REFUSED);
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect(fakeScheduler(container).activeIntervals()).toEqual([]);
        });

        it("Should log a failed dispute so it can be done by hand", async () => {
            await givenDelivery(container, { offers: [] });
            jest.spyOn(container.get(CSG_DELIVERY_HTTP), "disputeTrade").mockRejectedValue(DISPUTE_REFUSED);
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.stringContaining(`Disputing trade "${TRADE_ID}" failed: ${DISPUTE_REFUSED.message}`),
            );
        });

        it("Should count the max wait from when csgoempire sent the trade", async () => {
            await givenDelivery(container, { offers: [] });
            const { maxWaitMs } = container.get(TRACKING_OPTIONS);
            startTracking(container, trackedDelivery({ sentAt: fakeClock(container).now() - maxWaitMs }));

            await fakeScheduler(container).tick();

            expect(await deliveryStatus(container)).toBe(DeliveryStatus.DISPUTED);
        });

        it("Should accept a right offer that is already there instead of disputing", async () => {
            await givenDelivery(container);
            const { maxWaitMs } = container.get(TRACKING_OPTIONS);
            startTracking(container, trackedDelivery({ sentAt: fakeClock(container).now() - maxWaitMs }));

            await fakeScheduler(container).tick();

            expect(await deliveryStatus(container)).not.toBe(DeliveryStatus.DISPUTED);
        });

        it("Should not dispute while the last check of the offers fails", async () => {
            await givenDelivery(container);
            jest.spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive").mockRejectedValue(STEAM_DOWN);
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs);

            await fakeScheduler(container).tick();

            expect([await deliveryStatus(container), fakeScheduler(container).activeIntervals().length]).toEqual([
                DeliveryStatus.AWAITING_OFFER,
                1,
            ]);
        });

        it("Should not wait longer when the sent time lies in the future", async () => {
            await givenDelivery(container, { offers: [] });
            const { maxWaitMs } = container.get(TRACKING_OPTIONS);
            startTracking(container, trackedDelivery({ sentAt: fakeClock(container).now() + maxWaitMs }));
            fakeClock(container).advance(maxWaitMs);

            await fakeScheduler(container).tick();

            expect(await deliveryStatus(container)).toBe(DeliveryStatus.DISPUTED);
        });

        it("Should not dispute before the max wait", async () => {
            await givenDelivery(container, { offers: [] });
            startTracking(container);
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxWaitMs - ONE_MS);

            await fakeScheduler(container).tick();

            expect(await deliveryStatus(container)).toBe(DeliveryStatus.AWAITING_OFFER);
        });
    });

    describe("when steam rate limits a check", () => {
        it("Should skip the checks while backing off", async () => {
            await givenDelivery(container);
            const listSpy = jest
                .spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive")
                .mockRejectedValue(RATE_LIMITED);
            startTracking(container);
            await fakeScheduler(container).tick();
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).checkIntervalMs);

            await fakeScheduler(container).tick();

            expect(listSpy).toHaveBeenCalledTimes(1);
        });

        it("Should check again once the back off is over", async () => {
            await givenDelivery(container);
            const listSpy = jest
                .spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive")
                .mockRejectedValue(RATE_LIMITED);
            startTracking(container);
            await fakeScheduler(container).tick();
            fakeClock(container).advance(container.get(TRACKING_OPTIONS).maxBackoffMs);

            await fakeScheduler(container).tick();

            expect(listSpy).toHaveBeenCalledTimes(2);
        });

        it("Should double the back off after each rate limited check", async () => {
            await givenDelivery(container);
            const { checkIntervalMs } = container.get(TRACKING_OPTIONS);
            const listSpy = jest
                .spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive")
                .mockRejectedValue(RATE_LIMITED);
            startTracking(container);
            await fakeScheduler(container).tick();
            fakeClock(container).advance(checkIntervalMs * 2);
            await fakeScheduler(container).tick();
            fakeClock(container).advance(checkIntervalMs * 2);

            await fakeScheduler(container).tick();

            expect(listSpy).toHaveBeenCalledTimes(2);
        });

        it("Should log the back off", async () => {
            await givenDelivery(container);
            jest.spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive").mockRejectedValue(RATE_LIMITED);
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
            startTracking(container);

            await fakeScheduler(container).tick();

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.stringContaining(`Rate limited checking trade "${TRADE_ID}"`),
            );
        });
    });

    it("Should log a failed check and keep tracking", async () => {
        await givenDelivery(container);
        jest.spyOn(container.get(RECEIVED_OFFERS_GATEWAY), "listReceivedActive").mockRejectedValue(new Error("boom"));
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        startTracking(container);

        await fakeScheduler(container).tick();

        expect([loggerSpy.mock.calls.flat(), fakeScheduler(container).activeIntervals().length]).toEqual([
            expect.arrayContaining([`Checking the offers of trade "${TRADE_ID}" failed: boom`]),
            1,
        ]);
    });
});
