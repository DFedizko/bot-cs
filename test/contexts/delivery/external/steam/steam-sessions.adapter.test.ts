import { SteamSessionsAdapter } from "@/contexts/delivery/external/steam/steam-sessions.adapter";
import type { SteamLogin } from "@/contexts/delivery/infrastructure/steam/steam-login";
import { SteamTradeSessionFakeAdapter } from "./steam-trade-session.fake-adapter";

const login = (accountName: string): SteamLogin => ({
    accountName,
    password: "p",
    sharedSecret: "s",
    identitySecret: "i",
});
const createSession = () => jest.fn(() => new SteamTradeSessionFakeAdapter([]));

describe("SteamSessionsAdapter", () => {
    it("Should reuse the session of an account", () => {
        const sessions = new SteamSessionsAdapter(createSession());
        const session = sessions.sessionFor(login("buyer"));

        const again = sessions.sessionFor(login("buyer"));

        expect(again).toBe(session);
    });

    it("Should never share a session between accounts", () => {
        const sessions = new SteamSessionsAdapter(createSession());
        const session = sessions.sessionFor(login("buyer"));

        const other = sessions.sessionFor(login("other"));

        expect(other).not.toBe(session);
    });
});
