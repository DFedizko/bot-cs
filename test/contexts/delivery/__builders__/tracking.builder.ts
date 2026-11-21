import type { Container } from "inversify";
import { CLOCK, DELIVERY_TRACKERS, SCHEDULER } from "@/contexts/delivery/external/di/delivery.identifiers";
import type { TrackedDelivery } from "@/contexts/delivery/application/delivery-trackers";
import { ACCOUNT_ID, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";
import type { SchedulerFakeAdapter } from "@/contexts/delivery/external/scheduling/scheduler.fake-adapter";
import type { ClockFakeAdapter } from "@/contexts/delivery/external/scheduling/clock.fake-adapter";

export const SECOND_ACCOUNT_ID = 404220;
export const SECOND_TRADE_ID = 26124999;
export const SECOND_TRADE_OFFER_ID = 298883999;
export const SECOND_ASSET_ID = "34511549999";
export const SECOND_STEAM_ACCOUNT = "second-buyer";

export const trackedDelivery = (overrides: Partial<TrackedDelivery> = {}): TrackedDelivery => ({
    tradeId: TRADE_ID,
    accountId: ACCOUNT_ID,
    ...overrides,
});

export const fakeScheduler = (container: Container): SchedulerFakeAdapter =>
    container.get(SCHEDULER) as SchedulerFakeAdapter;

export const fakeClock = (container: Container): ClockFakeAdapter => container.get(CLOCK) as ClockFakeAdapter;

export const startTracking = (container: Container, delivery: TrackedDelivery = trackedDelivery()): boolean =>
    container.get(DELIVERY_TRACKERS).track(delivery);
