import type { Container } from "inversify";
import { maxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
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
const DELETE = "DELETE";

let container: Container;

describe("RemoveWantedItemHttpController", () => {
    beforeEach(async () => {
        container = testContainer();
        await container
            .get(WANTED_ITEM_REPOSITORY)
            .save(WantedItem.create({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: maxForPercentage("-3") }));
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should answer ok when the item is removed", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(DELETE, itemPath(ACCOUNT_ID, ITEM_NAME));

        expect(response).toEqual({ status: HttpStatus.OK, body: "" });
    });

    it("Should remove the item named in the path", async () => {
        const api = await startWantedItemsApi(container);

        await api.send(DELETE, itemPath(ACCOUNT_ID, ITEM_NAME));

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem).toBeUndefined();
    });

    it("Should answer not found when the account doesn't want the item", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(DELETE, itemPath(OTHER_ACCOUNT_ID, ITEM_NAME));

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
});
