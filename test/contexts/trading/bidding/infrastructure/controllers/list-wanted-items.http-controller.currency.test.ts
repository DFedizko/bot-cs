import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { UNKNOWN_CURRENCY } from "@/contexts/trading/bidding/infrastructure/docs/currency.error-examples";
import { itemsPath, startWantedItemsApi, type WantedItemsApi } from "./__builders__/wanted-items-api.builder";

const ACCOUNT_ID = 1;
const POST = "POST";
const GET = "GET";
const REDLINE = "AK-47 | Redline (Field-Tested)";
const MINUS_THREE_PERCENT = { type: "percentage", value: "-3" };
const COIN_MAX_VALUE = 19400;
const EUR_MAX_VALUE = 10898;

const addRedlineUpTo = (api: WantedItemsApi, maxFor: object) =>
    api.send(POST, itemsPath(ACCOUNT_ID), { name: REDLINE, maxFor });

const maxForsOf = (body: string) => JSON.parse(body).items.map(({ maxFor }: { maxFor: unknown }) => maxFor);

let container: Container;

describe("ListWantedItemsHttpController", () => {
    beforeEach(() => {
        container = testContainer();
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    describe("Currency", () => {
        it("Should show a max value in the asked currency", async () => {
            const api = await startWantedItemsApi(container);
            await addRedlineUpTo(api, { type: "value", value: COIN_MAX_VALUE });

            const response = await api.send(GET, `${itemsPath(ACCOUNT_ID)}?currency=EUR`);

            expect(maxForsOf(response.body)).toEqual([{ type: "value", value: EUR_MAX_VALUE }]);
        });

        it("Should keep a max percentage as it is in any currency", async () => {
            const api = await startWantedItemsApi(container);
            await addRedlineUpTo(api, MINUS_THREE_PERCENT);

            const response = await api.send(GET, `${itemsPath(ACCOUNT_ID)}?currency=GBP`);

            expect(maxForsOf(response.body)).toEqual([MINUS_THREE_PERCENT]);
        });

        it("Should name the currency of the amounts", async () => {
            const api = await startWantedItemsApi(container);

            const response = await api.send(GET, `${itemsPath(ACCOUNT_ID)}?currency=USD`);

            expect(JSON.parse(response.body).currency).toBe("USD");
        });

        it("Should not name a currency when none is asked", async () => {
            const api = await startWantedItemsApi(container);

            const response = await api.send(GET, itemsPath(ACCOUNT_ID));

            expect(JSON.parse(response.body)).not.toHaveProperty("currency");
        });

        it("Should answer bad request for a currency the bot doesn't show", async () => {
            const api = await startWantedItemsApi(container);

            const response = await api.send(GET, `${itemsPath(ACCOUNT_ID)}?currency=usd`);

            expect({ ...response, body: JSON.parse(response.body) }).toEqual({
                status: HttpStatus.BAD_REQUEST,
                body: UNKNOWN_CURRENCY.value,
            });
        });
    });
});
