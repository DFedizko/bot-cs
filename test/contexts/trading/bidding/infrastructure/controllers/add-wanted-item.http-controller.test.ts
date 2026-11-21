import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { WANTED_ITEM_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { ItemName } from "@/contexts/trading/bidding/domain/wanted-item/item-name";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { itemsPath, startWantedItemsApi } from "./__builders__/wanted-items-api.builder";

const ACCOUNT_ID = 1;
const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const POST = "POST";
const asiimov = {
    name: ITEM_NAME,
    maxFor: "-3",
    criteria: [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }],
};

let container: Container;

describe("AddWantedItemHttpController", () => {
    beforeEach(() => {
        container = testContainer();
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should answer ok when the item is added", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(POST, itemsPath(ACCOUNT_ID), asiimov);

        expect(response).toEqual({ status: HttpStatus.OK, body: "" });
    });

    it("Should add the item to the account of the path", async () => {
        const api = await startWantedItemsApi(container);

        await api.send(POST, itemsPath(ACCOUNT_ID), asiimov);

        const wantedItem = await container
            .get(WANTED_ITEM_REPOSITORY)
            .findByName(new AccountId(ACCOUNT_ID), new ItemName(ITEM_NAME));
        expect(wantedItem?.getCriteria()).toEqual([ItemCriterionType.IS_WEAR]);
    });

    it("Should answer conflict when the account already wants the item", async () => {
        const api = await startWantedItemsApi(container);
        await api.send(POST, itemsPath(ACCOUNT_ID), asiimov);

        const response = await api.send(POST, itemsPath(ACCOUNT_ID), asiimov);

        expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it("Should answer unprocessable entity for an invalid max for", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(POST, itemsPath(ACCOUNT_ID), { ...asiimov, maxFor: "a lot" });

        expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it("Should answer unprocessable entity for an unknown criterion", async () => {
        const api = await startWantedItemsApi(container);
        const criteria = [{ type: "IsShiny", value: WearName.FIELD_TESTED }];

        const response = await api.send(POST, itemsPath(ACCOUNT_ID), { ...asiimov, criteria });

        expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it("Should answer bad request when the name is missing", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(POST, itemsPath(ACCOUNT_ID), { maxFor: "-3" });

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("Should answer bad request when the criteria are not a list", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(POST, itemsPath(ACCOUNT_ID), { ...asiimov, criteria: "IsWear" });

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("Should answer bad request when the account id is not a number", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(POST, itemsPath("john"), asiimov);

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it.each(["0x1", "1e0", " 1", "+1", "1.0"])(
        "Should answer bad request when the account id %p is not written as plain digits",
        async (accountId) => {
            const api = await startWantedItemsApi(container);

            const response = await api.send(POST, itemsPath(accountId), asiimov);

            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        },
    );

    it("Should answer bad request when the body is not json", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(POST, itemsPath(ACCOUNT_ID));

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("Should name the failing fields of a bad request", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(POST, itemsPath("john"), { maxFor: "-3" });

        expect(JSON.parse(response.body).fields.map(({ path }: { path: string }) => path)).toEqual([
            "accountId",
            "name",
        ]);
    });
});
