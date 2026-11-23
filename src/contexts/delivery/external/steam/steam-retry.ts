import { SteamLoginError } from "./errors/steam-login.error";

export type SteamRetryOptions = {
    baseDelayMs: number;
    maxAttempts: number;
    sleep: (ms: number) => Promise<void>;
};

const TEMPORARY_ERRORS = /429|rate ?limit|not logged in|notloggedon|session expired|timed? ?out|econnreset/i;
const FIRST_ATTEMPT = 1;
const BACKOFF_FACTOR = 2;

export class SteamRetry {
    constructor(private readonly options: SteamRetryOptions) {}

    run<T>(action: () => Promise<T>, onRetry: (error: Error) => void = () => {}): Promise<T> {
        return this.attempt(action, onRetry, FIRST_ATTEMPT);
    }

    private async attempt<T>(action: () => Promise<T>, onRetry: (error: Error) => void, attempt: number): Promise<T> {
        try {
            return await action();
        } catch (error) {
            if (!this.shouldRetry(error, attempt)) throw error;
            onRetry(error as Error);
            await this.options.sleep(this.delayFor(attempt));
            return this.attempt(action, onRetry, attempt + 1);
        }
    }

    private shouldRetry(error: unknown, attempt: number): boolean {
        if (error instanceof SteamLoginError || !(error instanceof Error)) return false;
        return attempt < this.options.maxAttempts && TEMPORARY_ERRORS.test(error.message);
    }

    private delayFor(attempt: number): number {
        return this.options.baseDelayMs * BACKOFF_FACTOR ** (attempt - FIRST_ATTEMPT);
    }
}
