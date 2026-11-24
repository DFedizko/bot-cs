import type { Container } from "inversify";
import { COMMAND_BUS, HTTP_SERVER, LOGGER } from "@/packages/external/di/packages.identifiers";
import { freePort } from "@/packages/external/http/__builders__/free-port.builder";
import { LoadCatalogCommand } from "@/contexts/catalog/application/load-catalog/load-catalog.command";
import { SEARCH_CATALOG_ITEMS_CONTROLLER } from "@/contexts/catalog/external/di/catalog.identifiers";

type ApiResponse = { status: number; body: unknown };

export type CatalogApi = {
    search(query: string): Promise<ApiResponse>;
};

const ITEMS_PATH = "/catalog/items";

export const loadCatalog = async (container: Container): Promise<void> =>
    (await container.getAsync(COMMAND_BUS)).dispatch(new LoadCatalogCommand());

export const startCatalogApi = async (container: Container): Promise<CatalogApi> => {
    jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    await container.getAsync(SEARCH_CATALOG_ITEMS_CONTROLLER);
    const port = freePort();
    container.get(HTTP_SERVER).listen(port);
    return {
        search: async (query) => {
            const response = await fetch(`http://localhost:${port}${ITEMS_PATH}?${query}`);
            return { status: response.status, body: await response.json() };
        },
    };
};
