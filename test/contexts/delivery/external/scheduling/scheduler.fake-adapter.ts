import type { ScheduledTask, Scheduler } from "@/contexts/delivery/infrastructure/tracking/scheduler";

type FakeTask = { intervalMs: number; run: () => Promise<void>; cancelled: boolean };

const ONCE = 1;

export class SchedulerFakeAdapter implements Scheduler {
    private readonly tasks: FakeTask[] = [];

    every(intervalMs: number, run: () => Promise<void>): ScheduledTask {
        const task: FakeTask = { intervalMs, run, cancelled: false };
        this.tasks.push(task);
        return { cancel: () => (task.cancelled = true) };
    }

    async tick(concurrentRuns = ONCE): Promise<void> {
        await Promise.all(this.activeTasks().flatMap((task) => Array.from({ length: concurrentRuns }, task.run)));
    }

    activeIntervals(): number[] {
        return this.activeTasks().map((task) => task.intervalMs);
    }

    private activeTasks(): FakeTask[] {
        return this.tasks.filter((task) => !task.cancelled);
    }
}
