import type { Mock } from "bun:test";
import type { Container } from "inversify";
import { Bootstrap } from "@/composition-root/bootstrap";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import { CSG_WS_CLIENT } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { ACCOUNT_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import type { CsgWsClient } from "@/contexts/trading/shared/infrastructure/csgoempire/csg.ws-client";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";

const DRY_RUN_ENV = "development";

let container: Container;
let wsOnSpy: Mock<CsgWsClient["on"]>;
let bootstrap: Bootstrap;

describe("Bootstrap", () => {
    beforeEach(async () => {
        container = testContainer(DRY_RUN_ENV);
        wsOnSpy = jest.spyOn(await container.getAsync(CSG_WS_CLIENT), "on");
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        bootstrap = new Bootstrap(container);
    });

    it("Should synchronize the csgoempire account", async () => {
        await bootstrap.run();

        const account = await container.get(ACCOUNT_REPOSITORY).findById(new AccountId(getSktMetafakeResponse.user.id));
        expect(account?.getName()).toBe(getSktMetafakeResponse.user.steam_name);
    });

    it("Should start the csgoempire session", async () => {
        await bootstrap.run();

        expect(wsOnSpy).toHaveBeenCalledWith("init", expect.any(Function));
    });

    it("Should listen to new items", async () => {
        await bootstrap.run();

        expect(wsOnSpy).toHaveBeenCalledWith("new_item", expect.any(Function));
    });
});
