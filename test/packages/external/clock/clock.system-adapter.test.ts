import { ClockSystemAdapter } from "@/packages/external/clock/clock.system-adapter";

const FIXED_TIME = new Date("2026-11-20T14:03:00Z");

describe("ClockSystemAdapter", () => {
    beforeEach(() => {
        jest.useFakeTimers({ now: FIXED_TIME });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("Should read the current time in milliseconds", () => {
        const now = new ClockSystemAdapter().now();

        expect(now).toBe(FIXED_TIME.getTime());
    });
});
