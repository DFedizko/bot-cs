import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER, QUERY_BUS } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, MAX_PAGE_SIZE } from "@/packages/building-blocks/pagination";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ItemCriterionType } from "@/contexts/trading/bidding/domain/wanted-item/criteria/item-criterion";
import { ListWantedItemsQuery } from "@/contexts/trading/bidding/application/list-wanted-items/list-wanted-items.query";
import { enabledPath, itemsPath, startWantedItemsApi } from "./__builders__/wanted-items-api.builder";

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const SECOND_PAGE = 2;
const ONE_PER_PAGE = 1;
const THIRD_PAGE = 3;
const FOUR_PER_PAGE = 4;
const POST = "POST";
const GET = "GET";
const PATCH = "PATCH";
const ASIIMOV = "AWP | Asiimov (Field-Tested)";
const REDLINE = "AK-47 | Redline (Field-Tested)";
const MINUS_THREE_PERCENT = { type: "percentage", value: "-3" };
const FIELD_TESTED = [{ type: ItemCriterionType.IS_WEAR, value: WearName.FIELD_TESTED }];

const wanted = (name: string, enabled = true) => ({
    name,
    maxFor: MINUS_THREE_PERCENT,
    criteria: FIELD_TESTED,
    enabled,
});
const firstPage = (items: unknown[]) => ({ items, page: FIRST_PAGE, pageSize: DEFAULT_PAGE_SIZE, total: items.length });

const addAsiimovAndDisabledRedline = async (api: Awaited<ReturnType<typeof startWantedItemsApi>>) => {
    await api.send(POST, itemsPath(ACCOUNT_ID), { name: ASIIMOV, maxFor: MINUS_THREE_PERCENT, criteria: FIELD_TESTED });
    await api.send(POST, itemsPath(ACCOUNT_ID), { name: REDLINE, maxFor: MINUS_THREE_PERCENT, criteria: FIELD_TESTED });
    await api.send(PATCH, enabledPath(ACCOUNT_ID, REDLINE), { enabled: false });
};

let container: Container;

describe("ListWantedItemsHttpController", () => {
    beforeEach(() => {
        container = testContainer();
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should list the items added to the account", async () => {
        const api = await startWantedItemsApi(container);
        await addAsiimovAndDisabledRedline(api);

        const response = await api.send(GET, itemsPath(ACCOUNT_ID));

        expect({ ...response, body: JSON.parse(response.body) }).toEqual({
            status: HttpStatus.OK,
            body: firstPage([wanted(ASIIMOV), wanted(REDLINE, false)]),
        });
    });

    it("Should list only the items with the asked enabled state", async () => {
        const api = await startWantedItemsApi(container);
        await addAsiimovAndDisabledRedline(api);

        const response = await api.send(GET, `${itemsPath(ACCOUNT_ID)}?enabled=false`);

        expect(JSON.parse(response.body)).toEqual(firstPage([wanted(REDLINE, false)]));
    });

    it("Should list the asked page", async () => {
        const api = await startWantedItemsApi(container);
        await addAsiimovAndDisabledRedline(api);

        const response = await api.send(GET, `${itemsPath(ACCOUNT_ID)}?page=${SECOND_PAGE}&pageSize=${ONE_PER_PAGE}`);

        expect(JSON.parse(response.body)).toEqual({
            items: [wanted(REDLINE, false)],
            page: SECOND_PAGE,
            pageSize: ONE_PER_PAGE,
            total: 2,
        });
    });

    it("Should list nothing for an account that wants nothing", async () => {
        const api = await startWantedItemsApi(container);
        await addAsiimovAndDisabledRedline(api);

        const response = await api.send(GET, itemsPath(OTHER_ACCOUNT_ID));

        expect({ ...response, body: JSON.parse(response.body) }).toEqual({
            status: HttpStatus.OK,
            body: firstPage([]),
        });
    });

    it("Should ask the query bus with the validated input", async () => {
        const askSpy = jest.spyOn(container.get(QUERY_BUS), "ask");
        const api = await startWantedItemsApi(container);

        await api.send(GET, `${itemsPath(ACCOUNT_ID)}?enabled=true&page=${THIRD_PAGE}&pageSize=${FOUR_PER_PAGE}`);

        expect(askSpy).toHaveBeenCalledWith(
            new ListWantedItemsQuery({
                accountId: ACCOUNT_ID,
                enabled: true,
                page: THIRD_PAGE,
                pageSize: FOUR_PER_PAGE,
            }),
        );
    });

    it.each([
        ["a page below the first", "page=0"],
        ["a page that is not a number", "page=last"],
        ["a page size above the max", `pageSize=${MAX_PAGE_SIZE + 1}`],
        ["an enabled state that is not a boolean", "enabled=maybe"],
    ])("Should answer bad request for %s", async (_case, query) => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(GET, `${itemsPath(ACCOUNT_ID)}?${query}`);

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("Should answer bad request for an account id that is not a number", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(GET, itemsPath("john"));

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
});
