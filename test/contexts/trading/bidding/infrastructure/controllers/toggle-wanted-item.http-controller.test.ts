import { buildWantedItem } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { Container } from "inversify";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { WANTED_ITEM_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { enabledPath, startWantedItemsApi } from "./__builders__/wanted-items-api.builder";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const PATCH = "PATCH";

const findAsiimov = (container: Container, accountId: number) =>
    container.get(WANTED_ITEM_REPOSITORY).findByName(new AccountId(accountId), new ItemName(ITEM_NAME));

let container: Container;

describe("ToggleWantedItemHttpController", () => {
    beforeEach(async () => {
        container = testContainer();
        await container
            .get(WANTED_ITEM_REPOSITORY)
            .save(buildWantedItem({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: maxForPercentage("-3") }));
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should answer ok when the item is switched", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, enabledPath(ACCOUNT_ID, ITEM_NAME), { enabled: false });

        expect(response).toEqual({ status: HttpStatus.OK, body: "" });
    });

    it("Should disable the item named in the path", async () => {
        const api = await startWantedItemsApi(container);

        await api.send(PATCH, enabledPath(ACCOUNT_ID, ITEM_NAME), { enabled: false });

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.isEnabled()).toBe(false);
    });

    it("Should enable the item named in the path again", async () => {
        const api = await startWantedItemsApi(container);
        await api.send(PATCH, enabledPath(ACCOUNT_ID, ITEM_NAME), { enabled: false });

        await api.send(PATCH, enabledPath(ACCOUNT_ID, ITEM_NAME), { enabled: true });

        const wantedItem = await findAsiimov(container, ACCOUNT_ID);
        expect(wantedItem?.isEnabled()).toBe(true);
    });

    it("Should answer not found when the account doesn't want the item", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, enabledPath(OTHER_ACCOUNT_ID, ITEM_NAME), { enabled: false });

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it("Should answer bad request when the enabled state is missing", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, enabledPath(ACCOUNT_ID, ITEM_NAME), {});

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("Should answer bad request when the enabled state is not a boolean", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, enabledPath(ACCOUNT_ID, ITEM_NAME), { enabled: "no" });

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
});
