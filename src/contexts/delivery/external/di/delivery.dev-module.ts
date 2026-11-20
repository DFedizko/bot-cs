import { ContainerModule } from "inversify";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import type { Logger } from "@/packages/application/logger";
import type { SteamCredentials } from "../../application/steam-credentials";
import type { CsgoempireDeliveryHttp } from "../../infrastructure/http/csgoempire/csgoempire-delivery.http";
import type { SteamSessions } from "../../infrastructure/steam/steam-sessions";
import { CsgoempireTradesGatewayCsgoempireAdapter } from "../../infrastructure/gateways/csgoempire-trades.gateway.csgoempire-adapter";
import { CsgoempireTradesGatewayDryRunAdapter } from "../../infrastructure/gateways/csgoempire-trades.gateway.dry-run-adapter";
import { SteamTradeOffersGatewaySteamAdapter } from "../../infrastructure/gateways/steam-trade-offers.gateway.steam-adapter";
import { SteamTradeOffersGatewayDryRunAdapter } from "../../infrastructure/gateways/steam-trade-offers.gateway.dry-run-adapter";
import {
    CSGOEMPIRE_DELIVERY_HTTP,
    CSGOEMPIRE_TRADES,
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
            bind(CSGOEMPIRE_TRADES)
                .toResolvedValue(DeliveryDevModule.createCsgoempireTrades, [CSGOEMPIRE_DELIVERY_HTTP, LOGGER])
                .inSingletonScope();
        });
    }

    private static createSteamOffers(
        sessions: SteamSessions,
        credentials: SteamCredentials,
        logger: Logger,
    ): SteamTradeOffersGatewayDryRunAdapter {
        return new SteamTradeOffersGatewayDryRunAdapter(
            new SteamTradeOffersGatewaySteamAdapter(sessions, credentials),
            logger,
        );
    }

    private static createCsgoempireTrades(
        http: CsgoempireDeliveryHttp,
        logger: Logger,
    ): CsgoempireTradesGatewayDryRunAdapter {
        return new CsgoempireTradesGatewayDryRunAdapter(new CsgoempireTradesGatewayCsgoempireAdapter(http), logger);
    }
}
