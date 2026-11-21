export interface ScheduledTask {
    cancel(): void;
}

export interface Scheduler {
    every(intervalMs: number, task: () => Promise<void>): ScheduledTask;
}
