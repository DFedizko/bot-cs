import { SteamRetry } from "@/contexts/delivery/external/steam/steam-retry";
import { SteamLoginError } from "@/contexts/delivery/external/steam/steam-login.error";

const RATE_LIMITED = new Error("HTTP error 429");
const BASE_DELAY_MS = 1000;
const MAX_ATTEMPTS = 3;

const retry = (sleep = jest.fn<(ms: number) => Promise<void>>(async () => {})) => ({
    sleep,
    subject: new SteamRetry({ baseDelayMs: BASE_DELAY_MS, maxAttempts: MAX_ATTEMPTS, sleep }),
});

describe("SteamRetry", () => {
    it("Should return the result of an action that succeeds", async () => {
        const result = await retry().subject.run(async () => "ok");

        expect(result).toBe("ok");
    });

    it("Should back off exponentially when steam rate limits", async () => {
        const { sleep, subject } = retry();
        const action = jest
            .fn()
            .mockRejectedValueOnce(RATE_LIMITED)
            .mockRejectedValueOnce(RATE_LIMITED)
            .mockResolvedValue("ok");

        await subject.run(action);

        expect(sleep.mock.calls).toEqual([[BASE_DELAY_MS], [BASE_DELAY_MS * 2]]);
    });

    it("Should give up after the last attempt", async () => {
        const action = jest.fn().mockRejectedValue(RATE_LIMITED);

        await expect(retry().subject.run(action)).rejects.toThrow(RATE_LIMITED);
        expect(action).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    });

    it("Should not retry an error that isn't temporary", async () => {
        const action = jest.fn().mockRejectedValue(new Error("Offer #1 is not active"));

        await expect(retry().subject.run(action)).rejects.toThrow("Offer #1 is not active");
        expect(action).toHaveBeenCalledTimes(1);
    });

    it("Should never retry a login steam refused", async () => {
        const action = jest.fn().mockRejectedValue(new SteamLoginError("RateLimitExceeded"));

        await expect(retry().subject.run(action)).rejects.toThrow(SteamLoginError);
        expect(action).toHaveBeenCalledTimes(1);
    });

    it("Should let the caller renew the session before retrying", async () => {
        const expired = new Error("Not Logged In");
        const onRetry = jest.fn();
        const action = jest.fn().mockRejectedValueOnce(expired).mockResolvedValue("ok");

        await retry().subject.run(action, onRetry);

        expect(onRetry).toHaveBeenCalledWith(expired);
    });
});
