import { SteamLoginError } from "./steam-login.error";

export type SteamLoginPauseOptions = { cooldownMs: number; now: () => number };

const PAUSING_ERRORS = /429|rate ?limit|throttle/i;
const NOT_PAUSED = 0;

export class SteamLoginPause {
    private pausedUntil = NOT_PAUSED;

    constructor(private readonly options: SteamLoginPauseOptions) {}

    isPaused(): boolean {
        return this.options.now() < this.pausedUntil;
    }

    pauseAfter(error: Error): void {
        if (this.shouldPause(error)) this.pausedUntil = this.options.now() + this.options.cooldownMs;
    }

    private shouldPause(error: Error): boolean {
        return error instanceof SteamLoginError || PAUSING_ERRORS.test(error.message);
    }
}
