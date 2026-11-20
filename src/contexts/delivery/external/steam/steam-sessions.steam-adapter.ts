import type { SteamLogin } from "../../infrastructure/steam/steam-login";
import type { SteamSessions } from "../../infrastructure/steam/steam-sessions";
import type { SteamTradeSession } from "../../infrastructure/steam/steam-trade-session";

export type SteamSessionFactory = (login: SteamLogin) => SteamTradeSession;

export class SteamSessionsSteamAdapter implements SteamSessions {
    private readonly sessions = new Map<string, SteamTradeSession>();

    constructor(private readonly createSession: SteamSessionFactory) {}

    sessionFor(login: SteamLogin): SteamTradeSession {
        const session = this.sessions.get(login.accountName) ?? this.createSession(login);
        this.sessions.set(login.accountName, session);
        return session;
    }
}
