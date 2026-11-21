import type { Container } from "inversify";
import { RootContainer } from "@/composition-root/root-container";
import { fakeExternals } from "@/__builders__/externals.builder";
import { COMMAND_BUS, ENV, HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { HttpServerBunAdapter } from "@/packages/external/http/server/http-server.bun-adapter";
import { INIT_CSG_SESSION, SOCKET_METADATA } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import {
    ADD_WANTED_ITEM_CONTROLLER,
    AUCTION_GATEWAY,
    EDIT_WANTED_ITEM_CONTROLLER,
    NEW_ITEM_CONTROLLER,
    REMOVE_WANTED_ITEM_CONTROLLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AddWantedItemHttpController } from "@/contexts/trading/bidding/infrastructure/controllers/add-wanted-item.http-controller";
import { EditWantedItemHttpController } from "@/contexts/trading/bidding/infrastructure/controllers/edit-wanted-item.http-controller";
import { RemoveWantedItemHttpController } from "@/contexts/trading/bidding/infrastructure/controllers/remove-wanted-item.http-controller";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { InitCsgSessionWsController } from "@/contexts/trading/shared/infrastructure/controllers/init-csg-session.ws-controller";
import { NewItemWsController } from "@/contexts/trading/bidding/infrastructure/controllers/new-item.ws-controller";
import { AuctionGatewayDryRunAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.dry-run-adapter";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";

const API_KEY = "api-key";
const ANY_FREE_PORT = 0;
const AUCTION_GATEWAYS = [
    { nodeEnv: "development", gateway: AuctionGatewayDryRunAdapter },
    { nodeEnv: "test", gateway: AuctionGatewayDryRunAdapter },
    { nodeEnv: "production", gateway: AuctionGatewayCsgoempireAdapter },
] as const satisfies { nodeEnv: AppEnv["NODE_ENV"]; gateway: unknown }[];
const HTTP_CONTROLLERS = [
    { identifier: ADD_WANTED_ITEM_CONTROLLER, implementation: AddWantedItemHttpController },
    { identifier: EDIT_WANTED_ITEM_CONTROLLER, implementation: EditWantedItemHttpController },
    { identifier: REMOVE_WANTED_ITEM_CONTROLLER, implementation: RemoveWantedItemHttpController },
];

let container: Container;

describe.each([...AUCTION_GATEWAYS])("RootContainer in $nodeEnv", ({ nodeEnv, gateway }) => {
    beforeEach(() => {
        container = fakeExternals(
            new RootContainer({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: ANY_FREE_PORT }),
        );
    });

    it("Should bind the validated enviroment", () => {
        const env = container.get(ENV);

        expect(env).toEqual({ NODE_ENV: nodeEnv, CSGOEMPIRE_API_KEY: API_KEY, HTTP_PORT: ANY_FREE_PORT });
    });

    it("Should resolve the command bus", async () => {
        const commandBus = await container.getAsync(COMMAND_BUS);

        expect(commandBus).toBeInstanceOf(CommandBusInMemory);
    });

    it("Should resolve the bun http server", async () => {
        const httpServer = await container.getAsync(HTTP_SERVER);

        expect(httpServer).toBeInstanceOf(HttpServerBunAdapter);
    });

    it("Should resolve the socket metadata", async () => {
        const metadata = await container.getAsync(SOCKET_METADATA);

        expect(metadata).toEqual(getSktMetafakeResponse);
    });

    it("Should resolve the csgoempire session controller", async () => {
        const controller = await container.getAsync(INIT_CSG_SESSION);

        expect(controller).toBeInstanceOf(InitCsgSessionWsController);
    });

    it("Should resolve the new item controller", async () => {
        const controller = await container.getAsync(NEW_ITEM_CONTROLLER);

        expect(controller).toBeInstanceOf(NewItemWsController);
    });

    it.each(HTTP_CONTROLLERS)("Should resolve the $implementation.name", async ({ identifier, implementation }) => {
        const controller = await container.getAsync(identifier);

        expect(controller).toBeInstanceOf(implementation);
    });

    it("Should resolve the auction gateway of the enviroment", async () => {
        const auctionGateway = await container.getAsync(AUCTION_GATEWAY);

        expect(auctionGateway).toBeInstanceOf(gateway);
    });
});
