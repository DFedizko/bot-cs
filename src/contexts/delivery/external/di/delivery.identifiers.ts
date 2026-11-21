import { identifier } from "@/packages/external/di/identifier";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventListener } from "@/packages/application/event-listener";
import type { DeliveryRepository } from "../../application/delivery.repository";
import type { CsgoempireTradesGateway } from "../../application/csgoempire-trades.gateway";
import type { SteamCredentials } from "../../application/steam-credentials";
import type { SteamTradeOffersGateway } from "../../application/steam-trade-offers.gateway";
import type { StartDeliveryCommand } from "../../application/start-delivery/start-delivery.command";
import type { AcceptDeliveryOfferCommand } from "../../application/accept-delivery-offer/accept-delivery-offer.command";
import type { ScamOffersFoundEvent } from "../../application/accept-delivery-offer/scam-offers-found.event";
import type { DeliveryStepDispatcher } from "../../application/delivery-step-dispatcher";
import type { CancelTradeOfferCommand } from "../../application/cancel-trade-offer/cancel-trade-offer.command";
import type { ConfirmTradeOfferCommand } from "../../application/confirm-trade-offer/confirm-trade-offer.command";
import type { MarkDeliveryReceivedCommand } from "../../application/mark-delivery-received/mark-delivery-received.command";
import type { DisputeDeliveryCommand } from "../../application/dispute-delivery/dispute-delivery.command";
import type { TradeOfferAcceptedEvent } from "../../domain/delivery/events/trade-offer-accepted.event";
import type { DeliveryConfirmedEvent } from "../../domain/delivery/events/delivery-confirmed.event";
import type { CsgoempireDeliveryHttp } from "../../infrastructure/http/csgoempire/csgoempire-delivery.http";
import type { SteamSessions } from "../../infrastructure/steam/steam-sessions";

export const CSGOEMPIRE_DELIVERY_HTTP = identifier<CsgoempireDeliveryHttp>("CsgoempireDeliveryHttp");
export const STEAM_SESSIONS = identifier<SteamSessions>("SteamSessions");
export const STEAM_CREDENTIALS = identifier<SteamCredentials>("SteamCredentials");
export const STEAM_TRADE_OFFERS = identifier<SteamTradeOffersGateway>("SteamTradeOffersGateway");
export const CSGOEMPIRE_TRADES = identifier<CsgoempireTradesGateway>("CsgoempireTradesGateway");
export const DELIVERY_REPOSITORY = identifier<DeliveryRepository>("DeliveryRepository");

export const START_DELIVERY_HANDLER = identifier<CommandHandler<StartDeliveryCommand>>("StartDeliveryHandler");
export const ACCEPT_OFFER_HANDLER =
    identifier<CommandHandler<AcceptDeliveryOfferCommand>>("AcceptDeliveryOfferHandler");
export const CANCEL_OFFER_HANDLER = identifier<CommandHandler<CancelTradeOfferCommand>>("CancelTradeOfferHandler");
export const CONFIRM_OFFER_HANDLER = identifier<CommandHandler<ConfirmTradeOfferCommand>>("ConfirmTradeOfferHandler");
export const MARK_RECEIVED_HANDLER =
    identifier<CommandHandler<MarkDeliveryReceivedCommand>>("MarkDeliveryReceivedHandler");
export const DISPUTE_DELIVERY_HANDLER = identifier<CommandHandler<DisputeDeliveryCommand>>("DisputeDeliveryHandler");

export const DELIVERY_STEP_DISPATCHER = identifier<DeliveryStepDispatcher>("DeliveryStepDispatcher");
export const ON_SCAM_OFFERS_FOUND = identifier<EventListener<ScamOffersFoundEvent>>("OnScamOffersFoundCancelOffers");
export const ON_OFFER_ACCEPTED = identifier<EventListener<TradeOfferAcceptedEvent>>("OnTradeOfferAcceptedConfirm");
export const ON_DELIVERY_CONFIRMED = identifier<EventListener<DeliveryConfirmedEvent>>(
    "OnDeliveryConfirmedMarkReceived",
);
