import { ContainerModule } from "inversify";
import type { SteamCredentials } from "../../application/steam-credentials";
import type { CsgoempireDeliveryHttp } from "../../infrastructure/http/csgoempire/csgoempire-delivery.http";
import type { SteamSessions } from "../../infrastructure/steam/steam-sessions";
import { CsgoempireTradesGatewayCsgoempireAdapter } from "../../infrastructure/gateways/csgoempire-trades.gateway.csgoempire-adapter";
import { SteamTradeOffersGatewaySteamAdapter } from "../../infrastructure/gateways/steam-trade-offers.gateway.steam-adapter";
import {
    CSGOEMPIRE_DELIVERY_HTTP,
    CSGOEMPIRE_TRADES,
    STEAM_CREDENTIALS,
    STEAM_SESSIONS,
    STEAM_TRADE_OFFERS,
} from "./delivery.identifiers";

export class DeliveryProdModule extends ContainerModule {
    constructor() {
        super(({ bind }) => {
            bind(STEAM_TRADE_OFFERS)
                .toResolvedValue(
                    (sessions: SteamSessions, credentials: SteamCredentials) =>
                        new SteamTradeOffersGatewaySteamAdapter(sessions, credentials),
                    [STEAM_SESSIONS, STEAM_CREDENTIALS],
                )
                .inSingletonScope();
            bind(CSGOEMPIRE_TRADES)
                .toResolvedValue(
                    (http: CsgoempireDeliveryHttp) => new CsgoempireTradesGatewayCsgoempireAdapter(http),
                    [CSGOEMPIRE_DELIVERY_HTTP],
                )
                .inSingletonScope();
        });
    }
}
