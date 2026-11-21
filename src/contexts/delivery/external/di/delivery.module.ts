import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { COMMAND_HANDLER, ENV, EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CSGOEMPIRE_HTTP_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { DeliveryRepository } from "../../application/delivery.repository";
import type { CsgoempireTradesGateway } from "../../application/csgoempire-trades.gateway";
import type { SteamTradeOffersGateway } from "../../application/accept-delivery-offer/steam-trade-offers.gateway";
import { StartDeliveryCommandHandler } from "../../application/start-delivery/start-delivery.command-handler";
import { AcceptDeliveryOfferCommandHandler } from "../../application/accept-delivery-offer/accept-delivery-offer.command-handler";
import { DisputeDeliveryCommandHandler } from "../../application/dispute-delivery/dispute-delivery.command-handler";
import { DeliveryRepositoryInMemory } from "../../infrastructure/repositories/delivery.repository.in-memory";
import { CsgoempireDeliveryHttpAdapter } from "../http/csgoempire/csgoempire-delivery.http.adapter";
import { SteamCredentialsEnvAdapter } from "../credentials/steam-credentials.env-adapter";
import { SteamSessionsSteamAdapter } from "../steam/steam-sessions.steam-adapter";
import { SteamTradeSessionSteamAdapter } from "../steam/steam-trade-session.steam-adapter";
import { SteamRetry } from "../steam/steam-retry";
import { SteamLoginPause } from "../steam/steam-login-pause";
import type { SteamLogin } from "../../infrastructure/steam/steam-login";
import {
    ACCEPT_OFFER_HANDLER,
    CSGOEMPIRE_DELIVERY_HTTP,
    CSGOEMPIRE_TRADES,
    DELIVERY_REPOSITORY,
    DISPUTE_DELIVERY_HANDLER,
    START_DELIVERY_HANDLER,
    STEAM_CREDENTIALS,
    STEAM_SESSIONS,
    STEAM_TRADE_OFFERS,
} from "./delivery.identifiers";

const COMMAND_HANDLERS = [START_DELIVERY_HANDLER, ACCEPT_OFFER_HANDLER, DISPUTE_DELIVERY_HANDLER];
const STEAM_BASE_DELAY_MS = 30_000;
const STEAM_MAX_ATTEMPTS = 4;
const STEAM_LOGIN_COOLDOWN_MS = 15 * 60_000;

export class DeliveryModule extends ContainerModule {
    constructor() {
        super((options) => DeliveryModule.bindAll(options));
    }

    private static bindAll(options: ContainerModuleLoadOptions): void {
        DeliveryModule.bindExternals(options);
        DeliveryModule.bindHandlers(options);
        COMMAND_HANDLERS.forEach((handler) => options.bind(COMMAND_HANDLER).toService(handler));
    }

    private static bindExternals({ bind }: ContainerModuleLoadOptions): void {
        bind(CSGOEMPIRE_DELIVERY_HTTP)
            .toResolvedValue(
                (client: HttpClient) => new CsgoempireDeliveryHttpAdapter(client),
                [CSGOEMPIRE_HTTP_CLIENT],
            )
            .inSingletonScope();
        bind(STEAM_SESSIONS).toResolvedValue(DeliveryModule.createSteamSessions, [LOGGER]).inSingletonScope();
        bind(STEAM_CREDENTIALS)
            .toResolvedValue((env: AppEnv) => new SteamCredentialsEnvAdapter(env.STEAM_ACCOUNTS), [ENV])
            .inSingletonScope();
        bind(DELIVERY_REPOSITORY)
            .toResolvedValue(() => new DeliveryRepositoryInMemory())
            .inSingletonScope();
    }

    private static bindHandlers({ bind }: ContainerModuleLoadOptions): void {
        bind(START_DELIVERY_HANDLER)
            .toResolvedValue(
                (repo: DeliveryRepository, bus: EventBus, logger: Logger) =>
                    new StartDeliveryCommandHandler(repo, bus, logger),
                [DELIVERY_REPOSITORY, EVENT_BUS, LOGGER],
            )
            .inSingletonScope();
        bind(ACCEPT_OFFER_HANDLER)
            .toResolvedValue(DeliveryModule.createAcceptOffer, [
                DELIVERY_REPOSITORY,
                STEAM_TRADE_OFFERS,
                CSGOEMPIRE_TRADES,
                EVENT_BUS,
                LOGGER,
            ])
            .inSingletonScope();
        bind(DISPUTE_DELIVERY_HANDLER)
            .toResolvedValue(
                (repo: DeliveryRepository, trades: CsgoempireTradesGateway, bus: EventBus, logger: Logger) =>
                    new DisputeDeliveryCommandHandler(repo, trades, bus, logger),
                [DELIVERY_REPOSITORY, CSGOEMPIRE_TRADES, EVENT_BUS, LOGGER],
            )
            .inSingletonScope();
    }

    private static createSteamSessions(logger: Logger): SteamSessionsSteamAdapter {
        const retry = new SteamRetry({
            baseDelayMs: STEAM_BASE_DELAY_MS,
            maxAttempts: STEAM_MAX_ATTEMPTS,
            sleep: (ms) => Bun.sleep(ms),
        });
        return new SteamSessionsSteamAdapter(
            (login: SteamLogin) =>
                new SteamTradeSessionSteamAdapter(login, logger, retry, DeliveryModule.createLoginPause()),
        );
    }

    private static createLoginPause(): SteamLoginPause {
        return new SteamLoginPause({ cooldownMs: STEAM_LOGIN_COOLDOWN_MS, now: () => Date.now() });
    }

    private static createAcceptOffer(
        repository: DeliveryRepository,
        steamOffers: SteamTradeOffersGateway,
        csgoempireTrades: CsgoempireTradesGateway,
        eventBus: EventBus,
        logger: Logger,
    ): AcceptDeliveryOfferCommandHandler {
        return new AcceptDeliveryOfferCommandHandler(repository, steamOffers, csgoempireTrades, eventBus, logger);
    }
}
