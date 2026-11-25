import type { QueryBus } from "@/packages/application/query-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpRequestInput } from "@/packages/infrastructure/http/http-request-input";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { SearchCatalogItemsQuery } from "../../application/search-catalog-items/search-catalog-items.query";

export type SearchCatalogItemsInput = {
    q: string;
    limit?: number;
};

export class SearchCatalogItemsHttpController implements HttpController {
    static readonly PATH = "/catalog/items";

    constructor(
        httpServer: HttpServer,
        private readonly queryBus: QueryBus,
        private readonly validator: Validator<SearchCatalogItemsInput>,
        doc: HttpRouteDoc,
    ) {
        httpServer.get(SearchCatalogItemsHttpController.PATH, (request) => this.handle(request), {
            input: validator,
            doc,
        });
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { q, limit } = this.validator.validate(HttpRequestInput.fromQuery(request));
        const body = await this.queryBus.ask(new SearchCatalogItemsQuery({ text: q, limit }));
        return { status: HttpStatus.OK, body };
    }
}
