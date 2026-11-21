import type { Container } from "inversify";
import { Bootstrap } from "@/composition-root/bootstrap";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, ENV, HTTP_SERVER, LOGGER } from "@/packages/external/di/packages.identifiers";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { ACCOUNT_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";

const DRY_RUN_ENV = "development";
const WANTED_ITEMS_PATH = "/accounts/:accountId/wanted-items";
const WANTED_ITEM_PATH = `${WANTED_ITEMS_PATH}/:name`;
const WANTED_ITEM_ENABLED_PATH = `${WANTED_ITEM_PATH}/enabled`;
const WANTED_ITEM_ROUTES = [
    ["post", WANTED_ITEMS_PATH],
    ["patch", WANTED_ITEM_PATH],
    ["delete", WANTED_ITEM_PATH],
    ["patch", WANTED_ITEM_ENABLED_PATH],
] as const;

let container: Container;

describe("Bootstrap", () => {
    beforeEach(() => {
        container = testContainer(DRY_RUN_ENV);
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should synchronize the csgoempire account", async () => {
        await new Bootstrap(container).run();

        const account = await container.get(ACCOUNT_REPOSITORY).findById(new AccountId(getSktMetafakeResponse.user.id));
        expect(account?.getName()).toBe(getSktMetafakeResponse.user.steam_name);
    });

    it("Should start the csgoempire session", async () => {
        const wsOnSpy = jest.spyOn(await container.getAsync(CSG_WS_CLIENT), "on");

        await new Bootstrap(container).run();

        expect(wsOnSpy).toHaveBeenCalledWith("init", expect.any(Function));
    });

    it("Should listen to new items", async () => {
        const wsOnSpy = jest.spyOn(await container.getAsync(CSG_WS_CLIENT), "on");

        await new Bootstrap(container).run();

        expect(wsOnSpy).toHaveBeenCalledWith("new_item", expect.any(Function));
    });

    it("Should start the http server on the configured port", async () => {
        const listenSpy = jest.spyOn(container.get(HTTP_SERVER), "listen");

        await new Bootstrap(container).run();

        expect(listenSpy).toHaveBeenCalledWith(container.get(ENV).HTTP_PORT);
    });

    it.each(WANTED_ITEM_ROUTES)("Should serve %s %s", async (method, path) => {
        const routeSpy = jest.spyOn(container.get(HTTP_SERVER), method);

        await new Bootstrap(container).run();

        expect(routeSpy).toHaveBeenCalledWith(path, expect.any(Function));
    });

    it("Should register the routes before listening", async () => {
        const httpServer = container.get(HTTP_SERVER);
        const postSpy = jest.spyOn(httpServer, "post");
        const listenSpy = jest.spyOn(httpServer, "listen");

        await new Bootstrap(container).run();

        expect(postSpy.mock.invocationCallOrder[0]).toBeLessThan(listenSpy.mock.invocationCallOrder[0]!);
    });

    it("Should start the http server before synchronizing with csgoempire", async () => {
        const listenSpy = jest.spyOn(container.get(HTTP_SERVER), "listen");
        const dispatchSpy = jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch");

        await new Bootstrap(container).run();

        expect(listenSpy.mock.invocationCallOrder[0]).toBeLessThan(dispatchSpy.mock.invocationCallOrder[0]!);
    });
});
