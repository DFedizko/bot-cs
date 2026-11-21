import type { Container } from "inversify";
import { fakeExternals } from "@/__builders__/externals.builder";
import { COMMAND_HANDLER, EVENT_LISTENER } from "@/packages/external/di/packages.identifiers";
import {
    ACCEPT_OFFER_HANDLER,
    CANCEL_OFFER_HANDLER,
    CONFIRM_OFFER_HANDLER,
    CSG_DELIVERY_HTTP,
    DELIVERY_REPOSITORY,
    OFFER_ACCEPTANCE_GATEWAY,
    OFFER_CANCELLATION_GATEWAY,
    OFFER_CONFIRMATION_GATEWAY,
    RECEIVED_OFFERS_GATEWAY,
    DISPUTE_DELIVERY_HANDLER,
    MARK_RECEIVED_HANDLER,
    ON_DELIVERY_CONFIRMED,
    ON_OFFER_ACCEPTED,
    ON_SCAM_OFFERS_FOUND,
    START_DELIVERY_HANDLER,
    STEAM_CREDENTIALS,
    STEAM_SESSIONS,
    STEAM_TRADE_OFFERS,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { CsgDeliveryHttpAdapter } from "@/contexts/delivery/external/http/csgoempire/csg-delivery.http.adapter";
import { SteamSessionsAdapter } from "@/contexts/delivery/external/steam/steam-sessions.adapter";
import { SteamCredentialsEnvAdapter } from "@/contexts/delivery/external/credentials/steam-credentials.env-adapter";
import { DeliveryRepositoryInMemory } from "@/contexts/delivery/infrastructure/repositories/delivery.repository.in-memory";
import { StartDeliveryCommandHandler } from "@/contexts/delivery/application/start-delivery/start-delivery.command-handler";
import { AcceptDeliveryOfferCommandHandler } from "@/contexts/delivery/application/accept-delivery-offer/accept-delivery-offer.command-handler";
import { DisputeDeliveryCommandHandler } from "@/contexts/delivery/application/dispute-delivery/dispute-delivery.command-handler";
import { CancelTradeOfferCommandHandler } from "@/contexts/delivery/application/cancel-trade-offer/cancel-trade-offer.command-handler";
import { ConfirmTradeOfferCommandHandler } from "@/contexts/delivery/application/confirm-trade-offer/confirm-trade-offer.command-handler";
import { MarkDeliveryReceivedCommandHandler } from "@/contexts/delivery/application/mark-delivery-received/mark-delivery-received.command-handler";
import { OnScamOffersFoundCancelOffers } from "@/contexts/delivery/application/cancel-trade-offer/on-scam-offers-found-cancel-offers";
import { OnTradeOfferAcceptedConfirm } from "@/contexts/delivery/application/confirm-trade-offer/on-trade-offer-accepted-confirm";
import { OnDeliveryConfirmedMarkReceived } from "@/contexts/delivery/application/mark-delivery-received/on-delivery-confirmed-mark-received";
import { deliveryContainer, type DeliveryEnv } from "./__builders__/delivery-container.builder";

const ENVIRONMENTS: DeliveryEnv[] = ["development", "production"];
const COMMAND_HANDLERS = [
    { identifier: START_DELIVERY_HANDLER, implementation: StartDeliveryCommandHandler },
    { identifier: ACCEPT_OFFER_HANDLER, implementation: AcceptDeliveryOfferCommandHandler },
    { identifier: CANCEL_OFFER_HANDLER, implementation: CancelTradeOfferCommandHandler },
    { identifier: CONFIRM_OFFER_HANDLER, implementation: ConfirmTradeOfferCommandHandler },
    { identifier: MARK_RECEIVED_HANDLER, implementation: MarkDeliveryReceivedCommandHandler },
    { identifier: DISPUTE_DELIVERY_HANDLER, implementation: DisputeDeliveryCommandHandler },
];
const EVENT_LISTENERS = [
    { identifier: ON_SCAM_OFFERS_FOUND, implementation: OnScamOffersFoundCancelOffers },
    { identifier: ON_OFFER_ACCEPTED, implementation: OnTradeOfferAcceptedConfirm },
    { identifier: ON_DELIVERY_CONFIRMED, implementation: OnDeliveryConfirmedMarkReceived },
];

let container: Container;

describe.each(ENVIRONMENTS)("DeliveryModule in %s", (nodeEnv) => {
    beforeEach(() => {
        container = deliveryContainer(nodeEnv);
    });

    it("Should bind the csgoempire delivery http adapter", () => {
        const http = container.get(CSG_DELIVERY_HTTP);

        expect(http).toBeInstanceOf(CsgDeliveryHttpAdapter);
    });

    it("Should bind the steam sessions adapter", () => {
        const sessions = container.get(STEAM_SESSIONS);

        expect(sessions).toBeInstanceOf(SteamSessionsAdapter);
    });

    it("Should bind the steam credentials read from the env", () => {
        const credentials = container.get(STEAM_CREDENTIALS);

        expect(credentials).toBeInstanceOf(SteamCredentialsEnvAdapter);
    });

    it("Should bind the in-memory delivery repository", () => {
        const repository = container.get(DELIVERY_REPOSITORY);

        expect(repository).toBeInstanceOf(DeliveryRepositoryInMemory);
    });

    it.each(COMMAND_HANDLERS)("Should bind the $implementation.name", async ({ identifier, implementation }) => {
        const handler = await fakeExternals(container).getAsync(identifier);

        expect(handler).toBeInstanceOf(implementation);
    });

    it("Should register the delivery command handlers", async () => {
        const handlers = await fakeExternals(container).getAllAsync(COMMAND_HANDLER);

        expect(handlers).toEqual(
            expect.arrayContaining(COMMAND_HANDLERS.map(({ implementation }) => expect.any(implementation))),
        );
    });

    it.each(EVENT_LISTENERS)("Should bind the $implementation.name", async ({ identifier, implementation }) => {
        const listener = await fakeExternals(container).getAsync(identifier);

        expect(listener).toBeInstanceOf(implementation);
    });

    it("Should register the delivery event listeners", async () => {
        const listeners = await fakeExternals(container).getAllAsync(EVENT_LISTENER);

        expect(listeners).toEqual(
            expect.arrayContaining(EVENT_LISTENERS.map(({ implementation }) => expect.any(implementation))),
        );
    });

    it.each([
        RECEIVED_OFFERS_GATEWAY,
        OFFER_ACCEPTANCE_GATEWAY,
        OFFER_CONFIRMATION_GATEWAY,
        OFFER_CANCELLATION_GATEWAY,
    ])("Should give each use case its own port onto the one steam offers gateway (%s)", async (port) => {
        const gateway = await fakeExternals(container).getAsync(port);

        expect(gateway).toBe(await container.getAsync(STEAM_TRADE_OFFERS));
    });
});
