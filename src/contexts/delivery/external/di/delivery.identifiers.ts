import { identifier } from "@/packages/external/di/identifier";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { DeliveryRepository } from "../../application/delivery.repository";
import type { CsgoempireTradesGateway } from "../../application/csgoempire-trades.gateway";
import type { SteamCredentials } from "../../application/steam-credentials";
import type { SteamTradeOffersGateway } from "../../application/accept-delivery-offer/steam-trade-offers.gateway";
import type { StartDeliveryCommand } from "../../application/start-delivery/start-delivery.command";
import type { AcceptDeliveryOfferCommand } from "../../application/accept-delivery-offer/accept-delivery-offer.command";
import type { DisputeDeliveryCommand } from "../../application/dispute-delivery/dispute-delivery.command";
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
export const DISPUTE_DELIVERY_HANDLER = identifier<CommandHandler<DisputeDeliveryCommand>>("DisputeDeliveryHandler");
