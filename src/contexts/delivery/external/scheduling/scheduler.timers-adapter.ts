import type { ScheduledTask, Scheduler } from "../../infrastructure/tracking/scheduler";

export class SchedulerTimersAdapter implements Scheduler {
    every(intervalMs: number, task: () => Promise<void>): ScheduledTask {
        const timer = setInterval(() => void task(), intervalMs);
        return { cancel: () => clearInterval(timer) };
    }
}
