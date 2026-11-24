import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER, QUERY_BUS } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { Rarity } from "@/contexts/catalog/domain/catalog-item/rarity";
import { SearchCatalogItemsQuery } from "@/contexts/catalog/application/search-catalog-items/search-catalog-items.query";
import { awpAsiimovFieldTested } from "../../external/http/bymykel/__mocks__/bymykel-skin.mock";
import { loadCatalog, startCatalogApi } from "./__builders__/catalog-api.builder";

const LIMIT = 5;
const ASIIMOV = {
    marketHashName: "AWP | Asiimov (Field-Tested)",
    weapon: "AWP",
    skin: "Asiimov",
    wear: WearName.FIELD_TESTED,
    stattrak: false,
    souvenir: false,
    category: "Rifles",
    rarity: Rarity.COVERT,
    imageUrl: awpAsiimovFieldTested.image,
};
const STATTRAK_ASIIMOV = { ...ASIIMOV, marketHashName: "StatTrak™ AWP | Asiimov (Field-Tested)", stattrak: true };

let container: Container;

describe("SearchCatalogItemsHttpController", () => {
    beforeEach(() => {
        container = testContainer();
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should answer the catalog items that match the text", async () => {
        const api = await startCatalogApi(container);
        await loadCatalog(container);

        const response = await api.search("q=awp%20asii");

        expect(response).toEqual({ status: HttpStatus.OK, body: { items: [ASIIMOV, STATTRAK_ASIIMOV] } });
    });

    it("Should answer at most the asked number of items", async () => {
        const api = await startCatalogApi(container);
        await loadCatalog(container);

        const response = await api.search("q=awp%20asii&limit=1");

        expect(response.body).toEqual({ items: [ASIIMOV] });
    });

    it("Should ask the query bus with the trimmed text and the limit", async () => {
        const askSpy = jest.spyOn(container.get(QUERY_BUS), "ask");
        const api = await startCatalogApi(container);

        await api.search(`q=%20awp%20asii%20&limit=${LIMIT}`);

        expect(askSpy).toHaveBeenCalledWith(new SearchCatalogItemsQuery({ text: "awp asii", limit: LIMIT }));
    });

    it("Should answer service unavailable while the catalog is not loaded", async () => {
        const api = await startCatalogApi(container);

        const response = await api.search("q=awp%20asii");

        expect(response).toEqual({
            status: HttpStatus.SERVICE_UNAVAILABLE,
            body: { code: "CATALOG_UNAVAILABLE", message: "The catalog is not loaded yet; try again in a moment" },
        });
    });

    it.each([
        ["no text", "", "q"],
        ["a text of one character", "q=a", "q"],
        ["a text of one character between spaces", "q=%20%20a%20%20", "q"],
        ["a limit below one", "q=awp&limit=0", "limit"],
        ["a limit above the max", "q=awp&limit=51", "limit"],
        ["a limit that is not a whole number", "q=awp&limit=many", "limit"],
    ])("Should answer bad request naming the field for %s", async (_case, query, field) => {
        const api = await startCatalogApi(container);
        await loadCatalog(container);

        const response = await api.search(query);

        expect(response).toMatchObject({
            status: HttpStatus.BAD_REQUEST,
            body: { code: "VALIDATION_ERROR", fields: [{ path: field }] },
        });
    });
});
