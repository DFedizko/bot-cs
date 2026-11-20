import type { Container } from "inversify";
import { fakeExternals } from "@/__builders__/externals.builder";
import { COMMAND_HANDLER } from "@/packages/external/di/packages.identifiers";
import {
    ACCEPT_OFFER_HANDLER,
    CSGOEMPIRE_DELIVERY_HTTP,
    DELIVERY_REPOSITORY,
    DISPUTE_DELIVERY_HANDLER,
    START_DELIVERY_HANDLER,
    STEAM_CREDENTIALS,
    STEAM_SESSIONS,
} from "@/contexts/delivery/external/di/delivery.identifiers";
import { CsgoempireDeliveryHttpAdapter } from "@/contexts/delivery/external/http/csgoempire/csgoempire-delivery.http.adapter";
import { SteamSessionsSteamAdapter } from "@/contexts/delivery/external/steam/steam-sessions.steam-adapter";
import { SteamCredentialsEnvAdapter } from "@/contexts/delivery/external/credentials/steam-credentials.env-adapter";
import { DeliveryRepositoryInMemory } from "@/contexts/delivery/infrastructure/repositories/delivery.repository.in-memory";
import { StartDeliveryCommandHandler } from "@/contexts/delivery/application/start-delivery/start-delivery.command-handler";
import { AcceptDeliveryOfferCommandHandler } from "@/contexts/delivery/application/accept-delivery-offer/accept-delivery-offer.command-handler";
import { DisputeDeliveryCommandHandler } from "@/contexts/delivery/application/dispute-delivery/dispute-delivery.command-handler";
import { deliveryContainer, type DeliveryEnv } from "./__builders__/delivery-container.builder";

const ENVIRONMENTS: DeliveryEnv[] = ["development", "production"];
const COMMAND_HANDLERS = [
    { identifier: START_DELIVERY_HANDLER, implementation: StartDeliveryCommandHandler },
    { identifier: ACCEPT_OFFER_HANDLER, implementation: AcceptDeliveryOfferCommandHandler },
    { identifier: DISPUTE_DELIVERY_HANDLER, implementation: DisputeDeliveryCommandHandler },
];

let container: Container;

describe.each(ENVIRONMENTS)("DeliveryModule in %s", (nodeEnv) => {
    beforeEach(() => {
        container = deliveryContainer(nodeEnv);
    });

    it("Should bind the csgoempire delivery http adapter", () => {
        const http = container.get(CSGOEMPIRE_DELIVERY_HTTP);

        expect(http).toBeInstanceOf(CsgoempireDeliveryHttpAdapter);
    });

    it("Should bind the steam sessions adapter", () => {
        const sessions = container.get(STEAM_SESSIONS);

        expect(sessions).toBeInstanceOf(SteamSessionsSteamAdapter);
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

        expect(handlers).toEqual(COMMAND_HANDLERS.map(({ implementation }) => expect.any(implementation)));
    });
});
