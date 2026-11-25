import type { Clock } from "@/packages/application/clock";

export class ClockSystemAdapter implements Clock {
    now(): number {
        return Date.now();
    }
}
