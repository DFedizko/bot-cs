import type { DeliveryTrackers, TrackedDelivery } from "../../application/delivery-trackers";
import type { DeliveryTrackerFactory } from "./delivery-tracker";
import type { ScheduledTask, Scheduler } from "./scheduler";

export class DeliveryTrackersSchedulerAdapter implements DeliveryTrackers {
    private readonly running = new Map<string, ScheduledTask>();

    constructor(
        private readonly scheduler: Scheduler,
        private readonly createTracker: DeliveryTrackerFactory,
        private readonly checkIntervalMs: number,
    ) {}

    track(delivery: TrackedDelivery): boolean {
        const key = this.keyOf(delivery);
        if (this.running.has(key)) return false;
        const tracker = this.createTracker(delivery);
        this.running.set(
            key,
            this.scheduler.every(this.checkIntervalMs, () => tracker.tick()),
        );
        return true;
    }

    untrack(delivery: TrackedDelivery): boolean {
        const key = this.keyOf(delivery);
        const task = this.running.get(key);
        if (!task) return false;
        task.cancel();
        return this.running.delete(key);
    }

    private keyOf(delivery: TrackedDelivery): string {
        return `${delivery.accountId}:${delivery.tradeId}`;
    }
}
