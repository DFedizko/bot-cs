import { ContainerModule } from "inversify";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import type { Logger } from "@/packages/application/logger";
import type { SteamCredentials } from "../../application/steam-credentials";
import type { CsgDeliveryHttp } from "../../infrastructure/http/csgoempire/csg-delivery.http";
import type { SteamSessions } from "../../infrastructure/steam/steam-sessions";
import { CsgTradesGatewayAdapter } from "../../infrastructure/gateways/csg-trades.gateway.adapter";
import { CsgTradesGatewayDryRunAdapter } from "../../infrastructure/gateways/csg-trades.gateway.dry-run-adapter";
import { SteamTradeOffersAdapter } from "../../infrastructure/gateways/steam-trade-offers.adapter";
import { SteamTradeOffersDryRunAdapter } from "../../infrastructure/gateways/steam-trade-offers.dry-run-adapter";
import {
    CSG_DELIVERY_HTTP,
    CSG_TRADES,
    STEAM_CREDENTIALS,
    STEAM_SESSIONS,
    STEAM_TRADE_OFFERS,
} from "./delivery.identifiers";

export class DeliveryDevModule extends ContainerModule {
    constructor() {
        super(({ bind }) => {
            bind(STEAM_TRADE_OFFERS)
                .toResolvedValue(DeliveryDevModule.createSteamOffers, [STEAM_SESSIONS, STEAM_CREDENTIALS, LOGGER])
                .inSingletonScope();
            bind(CSG_TRADES)
                .toResolvedValue(DeliveryDevModule.createCsgTrades, [CSG_DELIVERY_HTTP, LOGGER])
                .inSingletonScope();
        });
    }

    private static createSteamOffers(
        sessions: SteamSessions,
        credentials: SteamCredentials,
        logger: Logger,
    ): SteamTradeOffersDryRunAdapter {
        return new SteamTradeOffersDryRunAdapter(new SteamTradeOffersAdapter(sessions, credentials), logger);
    }

    private static createCsgTrades(http: CsgDeliveryHttp, logger: Logger): CsgTradesGatewayDryRunAdapter {
        return new CsgTradesGatewayDryRunAdapter(new CsgTradesGatewayAdapter(http), logger);
    }
}
