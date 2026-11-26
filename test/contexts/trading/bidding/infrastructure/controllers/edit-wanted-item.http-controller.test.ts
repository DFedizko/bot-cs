import { buildWantedItem } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import type { Container } from "inversify";
import {
    maxForPercentage,
    maxForValue,
} from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { WANTED_ITEM_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { itemPath, startWantedItemsApi } from "./__builders__/wanted-items-api.builder";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const OTHER_ITEM_NAME = "AK-47 | Redline (Field-Tested)";
const PATCH = "PATCH";
const MINUS_FIVE_PERCENT = { type: "percentage", value: "-5" };
const MAX_VALUE = { type: "value", value: 19400 };

let container: Container;

describe("EditWantedItemHttpController", () => {
    beforeEach(async () => {
        container = testContainer();
        await container
            .get(WANTED_ITEM_REPOSITORY)
            .save(buildWantedItem({ accountId: ACCOUNT_ID, name: ITEM_NAME, maxFor: maxForPercentage("-3") }));
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should answer ok when the item is edited", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { maxFor: MINUS_FIVE_PERCENT });

        expect(response).toEqual({ status: HttpStatus.OK, body: "" });
    });

    it("Should edit the item named in the path", async () => {
        const api = await startWantedItemsApi(container);

        await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { maxFor: MINUS_FIVE_PERCENT });

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-5"));
    });

    it("Should edit the item of the path when the body names another item", async () => {
        await container
            .get(WANTED_ITEM_REPOSITORY)
            .save(buildWantedItem({ accountId: ACCOUNT_ID, name: OTHER_ITEM_NAME, maxFor: maxForPercentage("-3") }));
        const api = await startWantedItemsApi(container);

        await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { name: OTHER_ITEM_NAME, maxFor: MINUS_FIVE_PERCENT });

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-5"));
    });

    it("Should edit the item of the path account when the body names another account", async () => {
        const api = await startWantedItemsApi(container);

        await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), {
            accountId: OTHER_ACCOUNT_ID,
            maxFor: MINUS_FIVE_PERCENT,
        });

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toEqual(maxForPercentage("-5"));
    });

    it("Should answer not found when the account doesn't want the item", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, itemPath(OTHER_ACCOUNT_ID, ITEM_NAME), { maxFor: MINUS_FIVE_PERCENT });

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it("Should answer unprocessable entity when nothing changes", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), {});

        expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it("Should switch the item to a max value", async () => {
        const api = await startWantedItemsApi(container);

        await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { maxFor: MAX_VALUE });

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getMaxFor()).toEqual(maxForValue(19400));
    });

    it("Should answer unprocessable entity for a max value of zero", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { maxFor: { ...MAX_VALUE, value: 0 } });

        expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it.each([[true], ["-5"], [{ type: "discount", value: "-5" }], [{ type: "value", value: "19400" }]])(
        "Should answer bad request when the max for is %p",
        async (maxFor) => {
            const api = await startWantedItemsApi(container);

            const response = await api.send(PATCH, itemPath(ACCOUNT_ID, ITEM_NAME), { maxFor });

            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        },
    );
});
