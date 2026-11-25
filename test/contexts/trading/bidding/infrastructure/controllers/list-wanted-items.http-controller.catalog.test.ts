import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { CLOCK, HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { CATALOG_CACHE } from "@/contexts/catalog/external/di/catalog.identifiers";
import { ADDED_AT } from "@/contexts/trading/bidding/domain/wanted-item/__builders__/wanted-item.builder";
import { CatalogDetailsGatewayAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/catalog-details.gateway.adapter";
import type { WantedItemDto } from "@/contexts/trading/bidding/application/list-wanted-items/list-wanted-items.response";
import { listWantedItemsResponseSchema } from "@/contexts/trading/bidding/external/validation/list-wanted-items.response-schema";
import {
    akUncharted,
    m4a4Howl,
    stattrakAwpAsiimov,
    vanillaKarambit,
} from "@/contexts/catalog/external/http/bymykel/__mocks__/skins-not-grouped.mock";
import { itemsPath, startWantedItemsApi, type WantedItemsApi } from "./__builders__/wanted-items-api.builder";

const ACCOUNT_ID = 1;
const POST = "POST";
const GET = "GET";
const ONE_MINUTE_MS = 60_000;
const MINUS_THREE_PERCENT = { type: "percentage", value: "-3" };
const STATTRAK_ASIIMOV = stattrakAwpAsiimov.market_hash_name;
const UNCHARTED = akUncharted.market_hash_name;
const HOWL = m4a4Howl.market_hash_name;
const KARAMBIT = vanillaKarambit.market_hash_name;
const UNKNOWN = "AWP | Not In The Catalog (Field-Tested)";
const ADDED_IN_ORDER = [UNCHARTED, STATTRAK_ASIIMOV, UNKNOWN, KARAMBIT, HOWL];

type ListedPage = { items: WantedItemDto[] };

const addOneMinuteApart = async (api: WantedItemsApi, names: string[]) => {
    const clock = jest.spyOn(container.get(CLOCK), "now");
    names.forEach((_name, index) => clock.mockReturnValueOnce(ADDED_AT + index * ONE_MINUTE_MS));
    const addWanted = (name: string) =>
        api.send(POST, itemsPath(ACCOUNT_ID), { name, maxFor: MINUS_THREE_PERCENT, criteria: [] });
    await names.reduce<Promise<unknown>>((previous, name) => previous.then(() => addWanted(name)), Promise.resolve());
};

const listWith = async (query = "") => {
    const api = await startWantedItemsApi(container);
    await container.get(CATALOG_CACHE).warmUp();
    await addOneMinuteApart(api, ADDED_IN_ORDER);
    return api.send(GET, `${itemsPath(ACCOUNT_ID)}${query}`);
};

const listedPage = async (query = ""): Promise<ListedPage> => JSON.parse((await listWith(query)).body);

const catalogOf = (page: ListedPage, name: string) => page.items.find((item) => item.name === name)?.catalog;

let container: Container;

describe("ListWantedItemsHttpController with the catalog", () => {
    beforeEach(() => {
        container = testContainer();
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should fill the catalog details of an item the catalog knows", async () => {
        const page = await listedPage();

        expect(catalogOf(page, STATTRAK_ASIIMOV)).toEqual({
            imageUrl: stattrakAwpAsiimov.image,
            rarity: Rarity.COVERT,
            weapon: "AWP",
            skin: "Asiimov",
            wear: WearName.FIELD_TESTED,
            stattrak: true,
            souvenir: false,
        });
    });

    it("Should give null catalog details for an item the catalog doesn't know", async () => {
        const page = await listedPage();

        expect(catalogOf(page, UNKNOWN)).toBeNull();
    });

    it("Should keep a vanilla knife's real market name while calling its skin Vanilla", async () => {
        const page = await listedPage();

        expect(page.items.find((item) => item.catalog?.skin === CatalogDetailsGatewayAdapter.VANILLA_SKIN)).toEqual(
            expect.objectContaining({
                name: KARAMBIT,
                catalog: expect.objectContaining({ weapon: "Karambit", wear: null, imageUrl: vanillaKarambit.image }),
            }),
        );
    });

    it("Should sort by rarity, highest first, with unknown items last", async () => {
        const page = await listedPage("?sort=rarity&order=desc");

        expect(page.items.map(({ name }) => name)).toEqual([HOWL, KARAMBIT, STATTRAK_ASIIMOV, UNCHARTED, UNKNOWN]);
    });

    it("Should sort by rarity, lowest first, with unknown items first", async () => {
        const page = await listedPage("?sort=rarity&order=asc");

        expect(page.items.map(({ name }) => name)).toEqual([UNKNOWN, UNCHARTED, KARAMBIT, STATTRAK_ASIIMOV, HOWL]);
    });

    it("Should answer a page that matches its documented schema", async () => {
        const response = await listWith("?sort=rarity");

        const parsed = listWantedItemsResponseSchema.safeParse(JSON.parse(response.body));

        expect({ status: response.status, valid: parsed.success }).toEqual({ status: HttpStatus.OK, valid: true });
    });

    it("Should give null catalog details to every item while the catalog isn't loaded", async () => {
        const api = await startWantedItemsApi(container);
        await addOneMinuteApart(api, ADDED_IN_ORDER);

        const response = await api.send(GET, itemsPath(ACCOUNT_ID));

        expect((JSON.parse(response.body) as ListedPage).items.map(({ catalog }) => catalog)).toEqual(
            ADDED_IN_ORDER.map(() => null),
        );
    });
});
