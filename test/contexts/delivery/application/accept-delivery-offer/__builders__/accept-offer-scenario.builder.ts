import type { Container } from "inversify";
import {
    ACCEPT_OFFER_HANDLER,
    DELIVERY_REPOSITORY,
    STEAM_SESSIONS,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { AcceptDeliveryOfferCommand } from "@/contexts/delivery/application/accept-delivery-offer/accept-delivery-offer.command";
import type { Delivery } from "@/contexts/delivery/domain/delivery/delivery";
import type { SteamTradeOffer } from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import type { SteamFakeScenario } from "@/contexts/delivery/external/steam/steam-trade-session.fake-adapter";
import { SteamSessionsFakeAdapter } from "@/contexts/delivery/external/steam/steam-sessions.fake-adapter";
import { delivery, TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";

export const STEAM_ACCOUNT_NAME = "buyer";

type Scenario = { offers?: readonly SteamTradeOffer[]; steam?: SteamFakeScenario; tracked?: Delivery };

export const givenDelivery = async (container: Container, scenario: Scenario = {}): Promise<Delivery> => {
    const tracked = scenario.tracked ?? delivery();
    container.rebind(STEAM_SESSIONS).toConstantValue(new SteamSessionsFakeAdapter(scenario.offers, scenario.steam));
    await container.get(DELIVERY_REPOSITORY).save(tracked);
    return tracked;
};

export const acceptDeliveryOffer = (container: Container): Promise<void> =>
    container.get(ACCEPT_OFFER_HANDLER).handle(new AcceptDeliveryOfferCommand(TRADE_ID));

export const steamSession = (container: Container) =>
    (container.get(STEAM_SESSIONS) as SteamSessionsFakeAdapter).sessionFor({
        accountName: STEAM_ACCOUNT_NAME,
        password: "",
        sharedSecret: "",
        identitySecret: "",
    });
