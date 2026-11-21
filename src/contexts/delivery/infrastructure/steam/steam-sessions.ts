import type { SteamLogin } from "./steam-login";
import type { SteamTradeSession } from "./steam-trade-session";

export interface SteamSessions {
    sessionFor(login: SteamLogin): SteamTradeSession;
}
