import type { Clock } from "../../infrastructure/tracking/clock";

export class ClockSystemAdapter implements Clock {
    now(): number {
        return Date.now();
    }
}
