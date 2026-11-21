import { SchedulerTimersAdapter } from "@/contexts/delivery/external/scheduling/scheduler.timers-adapter";

const INTERVAL_MS = 45_000;
const THREE_INTERVALS_MS = INTERVAL_MS * 3;

describe("SchedulerTimersAdapter", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("Should run the task every interval", () => {
        const task = jest.fn(() => Promise.resolve());
        new SchedulerTimersAdapter().every(INTERVAL_MS, task);

        jest.advanceTimersByTime(THREE_INTERVALS_MS);

        expect(task).toHaveBeenCalledTimes(3);
    });

    it("Should not run the task before the first interval", () => {
        const task = jest.fn(() => Promise.resolve());

        new SchedulerTimersAdapter().every(INTERVAL_MS, task);

        expect(task).not.toHaveBeenCalled();
    });

    it("Should stop running a cancelled task", () => {
        const task = jest.fn(() => Promise.resolve());
        const scheduled = new SchedulerTimersAdapter().every(INTERVAL_MS, task);

        scheduled.cancel();

        jest.advanceTimersByTime(THREE_INTERVALS_MS);
        expect(task).not.toHaveBeenCalled();
    });
});
