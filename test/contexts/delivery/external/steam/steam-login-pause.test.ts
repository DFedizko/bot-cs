import { SteamLoginPause } from "@/contexts/delivery/external/steam/steam-login-pause";
import { SteamLoginError } from "@/contexts/delivery/external/steam/errors/steam-login.error";

const COOLDOWN_MS = 900_000;
const START_MS = 1_000_000;
const JUST_BEFORE_END_MS = START_MS + COOLDOWN_MS - 1;

const pauseAt = (clock: { now: number }) => new SteamLoginPause({ cooldownMs: COOLDOWN_MS, now: () => clock.now });

describe("SteamLoginPause", () => {
    it("Should let a login through by default", () => {
        const pause = pauseAt({ now: START_MS });

        expect(pause.isPaused()).toBe(false);
    });

    it.each([
        { reason: "a rate limit", error: new Error("RateLimitExceeded") },
        { reason: "an HTTP 429", error: new Error("HTTP error 429") },
        { reason: "a Steam Guard refusal", error: new SteamLoginError("Steam Guard asked for a code") },
    ])("Should pause logins after $reason", ({ error }) => {
        const clock = { now: START_MS };
        const pause = pauseAt(clock);
        pause.pauseAfter(error);
        clock.now = JUST_BEFORE_END_MS;

        const paused = pause.isPaused();

        expect(paused).toBe(true);
    });

    it("Should let logins through again once the cooldown is over", () => {
        const clock = { now: START_MS };
        const pause = pauseAt(clock);
        pause.pauseAfter(new Error("RateLimitExceeded"));
        clock.now = START_MS + COOLDOWN_MS;

        const paused = pause.isPaused();

        expect(paused).toBe(false);
    });

    it("Should not pause after a passing network error", () => {
        const pause = pauseAt({ now: START_MS });
        pause.pauseAfter(new Error("ECONNRESET"));

        const paused = pause.isPaused();

        expect(paused).toBe(false);
    });
});
