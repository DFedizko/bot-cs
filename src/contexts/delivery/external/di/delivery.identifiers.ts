import { identifier } from "@/packages/external/di/identifier";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventListener } from "@/packages/application/event-listener";
import type { DeliveryRepository } from "../../application/delivery.repository";
import type { CsgTradesGateway } from "../../application/csg-trades.gateway";
import type { SteamCredentials } from "../../application/steam-credentials";
import type { ReceivedOffersGateway } from "../../application/accept-delivery-offer/received-offers.gateway";
import type { OfferAcceptanceGateway } from "../../application/accept-delivery-offer/offer-acceptance.gateway";
import type { OfferConfirmationGateway } from "../../application/confirm-trade-offer/offer-confirmation.gateway";
import type { OfferCancellationGateway } from "../../application/cancel-trade-offer/offer-cancellation.gateway";
import type { StartDeliveryCommand } from "../../application/start-delivery/start-delivery.command";
import type { AcceptDeliveryOfferCommand } from "../../application/accept-delivery-offer/accept-delivery-offer.command";
import type { ScamOffersFoundEvent } from "../../application/accept-delivery-offer/scam-offers-found.event";
import type { CommandBus } from "@/packages/application/command-bus";
import type { CancelTradeOfferCommand } from "../../application/cancel-trade-offer/cancel-trade-offer.command";
import type { ConfirmTradeOfferCommand } from "../../application/confirm-trade-offer/confirm-trade-offer.command";
import type { MarkDeliveryReceivedCommand } from "../../application/mark-delivery-received/mark-delivery-received.command";
import type { DisputeDeliveryCommand } from "../../application/dispute-delivery/dispute-delivery.command";
import type { TradeOfferAcceptedEvent } from "../../domain/delivery/events/trade-offer-accepted.event";
import type { DeliveryConfirmedEvent } from "../../domain/delivery/events/delivery-confirmed.event";
import type { CsgDeliveryHttp } from "../../infrastructure/http/csgoempire/csg-delivery.http";
import type { SteamSessions } from "../../infrastructure/steam/steam-sessions";
import type { DeliveryTrackers } from "../../application/delivery-trackers";
import type { TrackDeliveryCommand } from "../../application/track-delivery/track-delivery.command";
import type { StopDeliveryTrackingCommand } from "../../application/stop-delivery-tracking/stop-delivery-tracking.command";
import type { Scheduler } from "../../infrastructure/tracking/scheduler";
import type { Clock } from "../../infrastructure/tracking/clock";
import type { TrackingOptions } from "../../infrastructure/tracking/tracking-options";

export const CSG_DELIVERY_HTTP = identifier<CsgDeliveryHttp>("CsgDeliveryHttp");
export const STEAM_SESSIONS = identifier<SteamSessions>("SteamSessions");
export const STEAM_CREDENTIALS = identifier<SteamCredentials>("SteamCredentials");
type SteamTradeOffers = ReceivedOffersGateway &
    OfferAcceptanceGateway &
    OfferConfirmationGateway &
    OfferCancellationGateway;

export const STEAM_TRADE_OFFERS = identifier<SteamTradeOffers>("SteamTradeOffers");
export const RECEIVED_OFFERS_GATEWAY = identifier<ReceivedOffersGateway>("ReceivedOffersGateway");
export const OFFER_ACCEPTANCE_GATEWAY = identifier<OfferAcceptanceGateway>("OfferAcceptanceGateway");
export const OFFER_CONFIRMATION_GATEWAY = identifier<OfferConfirmationGateway>("OfferConfirmationGateway");
export const OFFER_CANCELLATION_GATEWAY = identifier<OfferCancellationGateway>("OfferCancellationGateway");
export const CSG_TRADES = identifier<CsgTradesGateway>("CsgTradesGateway");
export const DELIVERY_REPOSITORY = identifier<DeliveryRepository>("DeliveryRepository");

export const START_DELIVERY_HANDLER = identifier<CommandHandler<StartDeliveryCommand>>("StartDeliveryHandler");
export const ACCEPT_OFFER_HANDLER =
    identifier<CommandHandler<AcceptDeliveryOfferCommand>>("AcceptDeliveryOfferHandler");
export const CANCEL_OFFER_HANDLER = identifier<CommandHandler<CancelTradeOfferCommand>>("CancelTradeOfferHandler");
export const CONFIRM_OFFER_HANDLER = identifier<CommandHandler<ConfirmTradeOfferCommand>>("ConfirmTradeOfferHandler");
export const MARK_RECEIVED_HANDLER =
    identifier<CommandHandler<MarkDeliveryReceivedCommand>>("MarkDeliveryReceivedHandler");
export const DISPUTE_DELIVERY_HANDLER = identifier<CommandHandler<DisputeDeliveryCommand>>("DisputeDeliveryHandler");

export const DELIVERY_COMMAND_BUS = identifier<CommandBus>("DeliveryCommandBus");
export const ON_SCAM_OFFERS_FOUND = identifier<EventListener<ScamOffersFoundEvent>>("OnScamOffersFoundCancelOffers");
export const ON_OFFER_ACCEPTED = identifier<EventListener<TradeOfferAcceptedEvent>>("OnTradeOfferAcceptedConfirm");
export const ON_DELIVERY_CONFIRMED = identifier<EventListener<DeliveryConfirmedEvent>>(
    "OnDeliveryConfirmedMarkReceived",
);

export const SCHEDULER = identifier<Scheduler>("Scheduler");
export const CLOCK = identifier<Clock>("Clock");
export const TRACKING_OPTIONS = identifier<TrackingOptions>("TrackingOptions");
export const DELIVERY_TRACKERS = identifier<DeliveryTrackers>("DeliveryTrackers");
export const TRACK_DELIVERY_HANDLER = identifier<CommandHandler<TrackDeliveryCommand>>("TrackDeliveryHandler");
export const STOP_TRACKING_HANDLER =
    identifier<CommandHandler<StopDeliveryTrackingCommand>>("StopDeliveryTrackingHandler");
