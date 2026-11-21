import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import {
    COMMAND_BUS,
    COMMAND_HANDLER,
    ENV,
    EVENT_BUS,
    EVENT_LISTENER,
    LOGGER,
} from "@/packages/external/di/packages.identifiers";
import type { CommandBus } from "@/packages/application/command-bus";
import { CSGOEMPIRE_HTTP_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { DeliveryRepository } from "../../application/delivery.repository";
import type { CsgTradesGateway } from "../../application/csg-trades.gateway";
import type { ReceivedOffersGateway } from "../../application/accept-delivery-offer/received-offers.gateway";
import type { OfferAcceptanceGateway } from "../../application/accept-delivery-offer/offer-acceptance.gateway";
import type { OfferConfirmationGateway } from "../../application/confirm-trade-offer/offer-confirmation.gateway";
import type { OfferCancellationGateway } from "../../application/cancel-trade-offer/offer-cancellation.gateway";
import { StartDeliveryCommandHandler } from "../../application/start-delivery/start-delivery.command-handler";
import { AcceptDeliveryOfferCommandHandler } from "../../application/accept-delivery-offer/accept-delivery-offer.command-handler";
import { DisputeDeliveryCommandHandler } from "../../application/dispute-delivery/dispute-delivery.command-handler";
import { CancelTradeOfferCommandHandler } from "../../application/cancel-trade-offer/cancel-trade-offer.command-handler";
import { ConfirmTradeOfferCommandHandler } from "../../application/confirm-trade-offer/confirm-trade-offer.command-handler";
import { MarkDeliveryReceivedCommandHandler } from "../../application/mark-delivery-received/mark-delivery-received.command-handler";
import { OnScamOffersFoundCancelOffers } from "../../application/cancel-trade-offer/on-scam-offers-found-cancel-offers";
import { CommandBusStepFailureDecorator } from "../../infrastructure/command-bus/command-bus.step-failure-decorator";
import { OnTradeOfferAcceptedConfirm } from "../../application/confirm-trade-offer/on-trade-offer-accepted-confirm";
import { OnDeliveryConfirmedMarkReceived } from "../../application/mark-delivery-received/on-delivery-confirmed-mark-received";
import { DeliveryRepositoryInMemory } from "../../infrastructure/repositories/delivery.repository.in-memory";
import { CsgDeliveryHttpAdapter } from "../http/csgoempire/csg-delivery.http.adapter";
import { SteamCredentialsEnvAdapter } from "../credentials/steam-credentials.env-adapter";
import { SteamSessionsAdapter } from "../steam/steam-sessions.adapter";
import { SteamTradeSessionAdapter } from "../steam/steam-trade-session.adapter";
import { SteamRetry } from "../steam/steam-retry";
import { SteamLoginPause } from "../steam/steam-login-pause";
import type { SteamLogin } from "../../infrastructure/steam/steam-login";
import {
    ACCEPT_OFFER_HANDLER,
    CANCEL_OFFER_HANDLER,
    CONFIRM_OFFER_HANDLER,
    CSG_DELIVERY_HTTP,
    CSG_TRADES,
    DELIVERY_REPOSITORY,
    DELIVERY_COMMAND_BUS,
    DISPUTE_DELIVERY_HANDLER,
    OFFER_ACCEPTANCE_GATEWAY,
    OFFER_CANCELLATION_GATEWAY,
    OFFER_CONFIRMATION_GATEWAY,
    RECEIVED_OFFERS_GATEWAY,
    MARK_RECEIVED_HANDLER,
    ON_DELIVERY_CONFIRMED,
    ON_OFFER_ACCEPTED,
    ON_SCAM_OFFERS_FOUND,
    START_DELIVERY_HANDLER,
    STEAM_CREDENTIALS,
    STEAM_SESSIONS,
    STEAM_TRADE_OFFERS,
} from "./delivery.identifiers";

const COMMAND_HANDLERS = [
    START_DELIVERY_HANDLER,
    ACCEPT_OFFER_HANDLER,
    CANCEL_OFFER_HANDLER,
    CONFIRM_OFFER_HANDLER,
    MARK_RECEIVED_HANDLER,
    DISPUTE_DELIVERY_HANDLER,
];
const STEAM_OFFER_PORTS = [
    RECEIVED_OFFERS_GATEWAY,
    OFFER_ACCEPTANCE_GATEWAY,
    OFFER_CONFIRMATION_GATEWAY,
    OFFER_CANCELLATION_GATEWAY,
];
const EVENT_LISTENERS = [ON_SCAM_OFFERS_FOUND, ON_OFFER_ACCEPTED, ON_DELIVERY_CONFIRMED];
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
        DeliveryModule.bindStepHandlers(options);
        DeliveryModule.bindListeners(options);
        STEAM_OFFER_PORTS.forEach((port) => options.bind(port).toService(STEAM_TRADE_OFFERS));
        COMMAND_HANDLERS.forEach((handler) => options.bind(COMMAND_HANDLER).toService(handler));
        EVENT_LISTENERS.forEach((listener) => options.bind(EVENT_LISTENER).toService(listener));
    }

    private static bindExternals({ bind }: ContainerModuleLoadOptions): void {
        bind(CSG_DELIVERY_HTTP)
            .toResolvedValue((client: HttpClient) => new CsgDeliveryHttpAdapter(client), [CSGOEMPIRE_HTTP_CLIENT])
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
                RECEIVED_OFFERS_GATEWAY,
                OFFER_ACCEPTANCE_GATEWAY,
                EVENT_BUS,
                LOGGER,
            ])
            .inSingletonScope();
        bind(DISPUTE_DELIVERY_HANDLER)
            .toResolvedValue(
                (repo: DeliveryRepository, trades: CsgTradesGateway, bus: EventBus, logger: Logger) =>
                    new DisputeDeliveryCommandHandler(repo, trades, bus, logger),
                [DELIVERY_REPOSITORY, CSG_TRADES, EVENT_BUS, LOGGER],
            )
            .inSingletonScope();
    }

    private static bindStepHandlers({ bind }: ContainerModuleLoadOptions): void {
        bind(CANCEL_OFFER_HANDLER)
            .toResolvedValue(
                (cancellation: OfferCancellationGateway, bus: EventBus, logger: Logger) =>
                    new CancelTradeOfferCommandHandler(cancellation, bus, logger),
                [OFFER_CANCELLATION_GATEWAY, EVENT_BUS, LOGGER],
            )
            .inSingletonScope();
        bind(CONFIRM_OFFER_HANDLER)
            .toResolvedValue(
                (repo: DeliveryRepository, confirmation: OfferConfirmationGateway, bus: EventBus, logger: Logger) =>
                    new ConfirmTradeOfferCommandHandler(repo, confirmation, bus, logger),
                [DELIVERY_REPOSITORY, OFFER_CONFIRMATION_GATEWAY, EVENT_BUS, LOGGER],
            )
            .inSingletonScope();
        bind(MARK_RECEIVED_HANDLER)
            .toResolvedValue(
                (repo: DeliveryRepository, trades: CsgTradesGateway, bus: EventBus, logger: Logger) =>
                    new MarkDeliveryReceivedCommandHandler(repo, trades, bus, logger),
                [DELIVERY_REPOSITORY, CSG_TRADES, EVENT_BUS, LOGGER],
            )
            .inSingletonScope();
    }

    private static bindListeners({ bind }: ContainerModuleLoadOptions): void {
        bind(DELIVERY_COMMAND_BUS)
            .toResolvedValue(
                (commandBus: CommandBus, eventBus: EventBus, logger: Logger) =>
                    new CommandBusStepFailureDecorator(commandBus, eventBus, logger),
                [COMMAND_BUS, EVENT_BUS, LOGGER],
            )
            .inSingletonScope();
        bind(ON_SCAM_OFFERS_FOUND)
            .toResolvedValue(
                (commandBus: CommandBus) => new OnScamOffersFoundCancelOffers(commandBus),
                [DELIVERY_COMMAND_BUS],
            )
            .inSingletonScope();
        bind(ON_OFFER_ACCEPTED)
            .toResolvedValue(
                (commandBus: CommandBus) => new OnTradeOfferAcceptedConfirm(commandBus),
                [DELIVERY_COMMAND_BUS],
            )
            .inSingletonScope();
        bind(ON_DELIVERY_CONFIRMED)
            .toResolvedValue(
                (commandBus: CommandBus) => new OnDeliveryConfirmedMarkReceived(commandBus),
                [DELIVERY_COMMAND_BUS],
            )
            .inSingletonScope();
    }

    private static createAcceptOffer(
        repository: DeliveryRepository,
        receivedOffers: ReceivedOffersGateway,
        acceptance: OfferAcceptanceGateway,
        eventBus: EventBus,
        logger: Logger,
    ): AcceptDeliveryOfferCommandHandler {
        return new AcceptDeliveryOfferCommandHandler(repository, receivedOffers, acceptance, eventBus, logger);
    }

    private static createSteamSessions(logger: Logger): SteamSessionsAdapter {
        const retry = new SteamRetry({
            baseDelayMs: STEAM_BASE_DELAY_MS,
            maxAttempts: STEAM_MAX_ATTEMPTS,
            sleep: (ms) => Bun.sleep(ms),
        });
        return new SteamSessionsAdapter(
            (login: SteamLogin) =>
                new SteamTradeSessionAdapter(login, logger, retry, DeliveryModule.createLoginPause()),
        );
    }

    private static createLoginPause(): SteamLoginPause {
        return new SteamLoginPause({ cooldownMs: STEAM_LOGIN_COOLDOWN_MS, now: () => Date.now() });
    }
}
