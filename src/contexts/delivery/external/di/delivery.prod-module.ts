import { ContainerModule } from "inversify";
import type { SteamCredentials } from "../../application/steam-credentials";
import type { CsgDeliveryHttp } from "../../infrastructure/http/csgoempire/csg-delivery.http";
import type { SteamSessions } from "../../infrastructure/steam/steam-sessions";
import { CsgTradesGatewayAdapter } from "../../infrastructure/gateways/csg-trades.gateway.adapter";
import { SteamTradeOffersGatewayAdapter } from "../../infrastructure/gateways/steam-trade-offers.gateway.adapter";
import {
    CSG_DELIVERY_HTTP,
    CSG_TRADES,
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
                        new SteamTradeOffersGatewayAdapter(sessions, credentials),
                    [STEAM_SESSIONS, STEAM_CREDENTIALS],
                )
                .inSingletonScope();
            bind(CSG_TRADES)
                .toResolvedValue((http: CsgDeliveryHttp) => new CsgTradesGatewayAdapter(http), [CSG_DELIVERY_HTTP])
                .inSingletonScope();
        });
    }
}
