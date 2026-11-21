import type { Clock } from "@/contexts/delivery/infrastructure/tracking/clock";

const START_OF_TEST_MS = 1_740_000_000_000;

export class ClockFakeAdapter implements Clock {
    private nowMs = START_OF_TEST_MS;

    now(): number {
        return this.nowMs;
    }

    advance(ms: number): void {
        this.nowMs += ms;
    }
}
