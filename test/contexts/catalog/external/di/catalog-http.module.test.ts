import type { Container } from "inversify";
import { fakeExternals } from "@/__builders__/externals.builder";
import { HTTP_CONTROLLER, HTTP_ERROR_MAPPER, HTTP_ROUTE_CATALOG } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { ValidatorZodAdapter } from "@/packages/external/validation/validator.zod-adapter";
import { CatalogUnavailableError } from "@/contexts/catalog/application/search-catalog-items/catalog-unavailable.error";
import { SearchCatalogItemsHttpController } from "@/contexts/catalog/infrastructure/controllers/search-catalog-items.http-controller";
import {
    SEARCH_CATALOG_ITEMS_CONTROLLER,
    SEARCH_CATALOG_ITEMS_VALIDATOR,
} from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogContainer, type CatalogEnv } from "./__builders__/catalog-container.builder";

const ENVIRONMENTS: CatalogEnv[] = ["development", "production"];
const GET = "get";

const searchRoute = (container: Container) =>
    container
        .get(HTTP_ROUTE_CATALOG)
        .routes()
        .find(({ method, path }) => method === GET && path === SearchCatalogItemsHttpController.PATH);

let container: Container;

describe.each(ENVIRONMENTS)("CatalogHttpModule in %s", (nodeEnv) => {
    beforeEach(() => {
        container = fakeExternals(catalogContainer(nodeEnv));
    });

    it("Should bind the search catalog items controller as an http controller", async () => {
        const controllers = await container.getAllAsync(HTTP_CONTROLLER);

        expect(controllers).toContain(await container.getAsync(SEARCH_CATALOG_ITEMS_CONTROLLER));
    });

    it("Should register the search route with its doc", async () => {
        await container.getAllAsync(HTTP_CONTROLLER);

        const route = searchRoute(container);

        expect(route?.doc?.summary).toBeString();
    });

    it("Should register the search route with its validator as input", async () => {
        await container.getAllAsync(HTTP_CONTROLLER);

        const route = searchRoute(container);

        expect(route?.input).toBe(container.get(SEARCH_CATALOG_ITEMS_VALIDATOR));
    });

    it("Should bind the zod validator of the search input", () => {
        const validator = container.get(SEARCH_CATALOG_ITEMS_VALIDATOR);

        expect(validator).toBeInstanceOf(ValidatorZodAdapter);
    });

    it("Should answer a catalog that is not loaded with service unavailable", () => {
        const response = container.get(HTTP_ERROR_MAPPER).map(new CatalogUnavailableError());

        expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });
});
