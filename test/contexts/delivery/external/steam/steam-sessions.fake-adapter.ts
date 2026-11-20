import type { SteamLogin } from "@/contexts/delivery/infrastructure/steam/steam-login";
import type { SteamSessions } from "@/contexts/delivery/infrastructure/steam/steam-sessions";
import type { SteamTradeOffer } from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import { SteamTradeSessionFakeAdapter, type SteamFakeScenario } from "./steam-trade-session.fake-adapter";
import { steamTradeOffer } from "./__mocks__/steam-trade-offer.mock";

export class SteamSessionsFakeAdapter implements SteamSessions {
    private readonly sessions = new Map<string, SteamTradeSessionFakeAdapter>();

    constructor(
        private readonly offers: readonly SteamTradeOffer[] = [steamTradeOffer()],
        private readonly scenario: SteamFakeScenario = {},
    ) {}

    sessionFor(login: SteamLogin): SteamTradeSessionFakeAdapter {
        const session =
            this.sessions.get(login.accountName) ?? new SteamTradeSessionFakeAdapter(this.offers, this.scenario);
        this.sessions.set(login.accountName, session);
        return session;
    }
}
