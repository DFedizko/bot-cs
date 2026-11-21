import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { WANTED_ITEM_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { WantedItem } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";
import { itemPath, startWantedItemsApi } from "./__builders__/wanted-items-api.builder";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const OTHER_ITEM_NAME = "AK-47 | Redline (Field-Tested)";
const PATCH = "PATCH";

let container: Container;

describe("EditWantedItemHttpController", () => {
    beforeEach(async () => {
        container = testContainer();
        await container
            .get(WANTED_ITEM_REPOSITORY)
            .save(WantedItem.create({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: "-3" }));
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should answer ok when the item is edited", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { maxFor: "-5" });

        expect(response).toEqual({ status: HttpStatus.OK, body: "" });
    });

    it("Should edit the item named in the path", async () => {
        const api = await startWantedItemsApi(container);

        await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { maxFor: "-5" });

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toBe("-5");
    });

    it("Should edit the item of the path when the body names another item", async () => {
        await container
            .get(WANTED_ITEM_REPOSITORY)
            .save(WantedItem.create({ accountId: ACCOUNT_ID, name: OTHER_ITEM_NAME, maxFor: "-3" }));
        const api = await startWantedItemsApi(container);

        await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { name: OTHER_ITEM_NAME, maxFor: "-5" });

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toBe("-5");
    });

    it("Should edit the item of the path account when the body names another account", async () => {
        const api = await startWantedItemsApi(container);

        await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { accountId: OTHER_ACCOUNT_ID, maxFor: "-5" });

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toBe("-5");
    });

    it("Should answer not found when the account doesn't want the item", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, itemPath(OTHER_ACCOUNT_ID, ITEM_NAME), { maxFor: "-5" });

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it("Should answer unprocessable entity when nothing changes", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), {});

        expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it("Should answer bad request when the max for is not a text", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { maxFor: true });

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
});
