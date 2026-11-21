import type { Container } from "inversify";
import { fakeExternals } from "@/__builders__/externals.builder";
import { COMMAND_HANDLER, EVENT_LISTENER } from "@/packages/external/di/packages.identifiers";
import {
    CLOCK,
    DELIVERY_TRACKERS,
    SCHEDULER,
    STOP_TRACKING_HANDLER,
    TRACK_DELIVERY_HANDLER,
    TRACKING_OPTIONS,
    ACTIVE_WITHDRAWALS_CONTROLLER,
    CSG_DELIVERY_WS_CLIENT,
    TRADE_STATUS_CONTROLLER,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { TradeStatusWsController } from "@/contexts/delivery/infrastructure/controllers/trade-status.ws-controller";
import { ActiveWithdrawalsStartupController } from "@/contexts/delivery/infrastructure/controllers/active-withdrawals.startup-controller";
import { SchedulerTimersAdapter } from "@/contexts/delivery/external/scheduling/scheduler.timers-adapter";
import { ClockSystemAdapter } from "@/contexts/delivery/external/scheduling/clock.system-adapter";
import { DeliveryTrackersSchedulerAdapter } from "@/contexts/delivery/infrastructure/tracking/delivery-trackers.scheduler-adapter";
import { TrackDeliveryCommandHandler } from "@/contexts/delivery/application/track-delivery/track-delivery.command-handler";
import { StopDeliveryTrackingCommandHandler } from "@/contexts/delivery/application/stop-delivery-tracking/stop-delivery-tracking.command-handler";
import { OnDeliveryEndedStopTracking } from "@/contexts/delivery/application/stop-delivery-tracking/on-delivery-ended-stop-tracking";
import { DELIVERY_ENDING_EVENTS } from "../../application/__mocks__/delivery-ended-events.mock";
import { deliveryContainer, type DeliveryEnv } from "./__builders__/delivery-container.builder";

const ENVIRONMENTS: DeliveryEnv[] = ["development", "production"];
const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60_000;
const DEFAULT_CHECK_INTERVAL_SECONDS = 45;
const DEFAULT_MAX_WAIT_MINUTES = 60;
const MAX_BACKOFF_MINUTES = 10;
const DEFAULT_OPTIONS = {
    checkIntervalMs: DEFAULT_CHECK_INTERVAL_SECONDS * MS_IN_SECOND,
    maxWaitMs: DEFAULT_MAX_WAIT_MINUTES * MS_IN_MINUTE,
    maxBackoffMs: MAX_BACKOFF_MINUTES * MS_IN_MINUTE,
};
const CHECK_INTERVAL_SECONDS = 90;
const MAX_WAIT_MINUTES = 120;
const COMMAND_HANDLERS = [
    { identifier: TRACK_DELIVERY_HANDLER, implementation: TrackDeliveryCommandHandler },
    { identifier: STOP_TRACKING_HANDLER, implementation: StopDeliveryTrackingCommandHandler },
];

let container: Container;

describe.each(ENVIRONMENTS)("DeliveryTrackingModule in %s", (nodeEnv) => {
    beforeEach(() => {
        container = deliveryContainer(nodeEnv);
    });

    it("Should schedule the checks with bun's timers", () => {
        const scheduler = container.get(SCHEDULER);

        expect(scheduler).toBeInstanceOf(SchedulerTimersAdapter);
    });

    it("Should read the time from the system clock", () => {
        const clock = container.get(CLOCK);

        expect(clock).toBeInstanceOf(ClockSystemAdapter);
    });

    it("Should track deliveries on the scheduler", () => {
        const trackers = container.get(DELIVERY_TRACKERS);

        expect(trackers).toBeInstanceOf(DeliveryTrackersSchedulerAdapter);
    });

    it("Should check gently by default", () => {
        const options = container.get(TRACKING_OPTIONS);

        expect(options).toEqual(DEFAULT_OPTIONS);
    });

    it("Should take the check interval and the max wait from the env", () => {
        const configured = deliveryContainer(nodeEnv, {
            DELIVERY_CHECK_INTERVAL_SECONDS: CHECK_INTERVAL_SECONDS,
            DELIVERY_MAX_WAIT_MINUTES: MAX_WAIT_MINUTES,
        });

        const options = configured.get(TRACKING_OPTIONS);

        expect(options).toMatchObject({
            checkIntervalMs: CHECK_INTERVAL_SECONDS * MS_IN_SECOND,
            maxWaitMs: MAX_WAIT_MINUTES * MS_IN_MINUTE,
        });
    });

    it.each(COMMAND_HANDLERS)("Should bind the $implementation.name", async ({ identifier, implementation }) => {
        const handler = await fakeExternals(container).getAsync(identifier);

        expect(handler).toBeInstanceOf(implementation);
    });

    it("Should register the tracking command handlers", async () => {
        const handlers = await fakeExternals(container).getAllAsync(COMMAND_HANDLER);

        expect(handlers).toEqual(
            expect.arrayContaining(COMMAND_HANDLERS.map(({ implementation }) => expect.any(implementation))),
        );
    });

    it("Should stop tracking on every event that ends a delivery", async () => {
        const listeners = await fakeExternals(container).getAllAsync(EVENT_LISTENER);

        const stopping = listeners.filter((listener) => listener instanceof OnDeliveryEndedStopTracking);
        expect(stopping.map((listener) => listener.subscribedTo())).toEqual(DELIVERY_ENDING_EVENTS);
    });

    it("Should listen to trade statuses on the csgoempire socket", async () => {
        const controller = await fakeExternals(container).getAsync(TRADE_STATUS_CONTROLLER);

        expect(controller).toBeInstanceOf(TradeStatusWsController);
    });

    it("Should give delivery the account's csgoempire socket", async () => {
        const wsClient = await fakeExternals(container).getAsync(CSG_DELIVERY_WS_CLIENT);

        expect(wsClient).toBe(await container.getAsync(CSG_WS_CLIENT));
    });

    it("Should bind the controller resuming active withdrawals", () => {
        const controller = fakeExternals(container).get(ACTIVE_WITHDRAWALS_CONTROLLER);

        expect(controller).toBeInstanceOf(ActiveWithdrawalsStartupController);
    });
});
