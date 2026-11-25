import type { QueryBus } from "@/packages/application/query-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpRequestInput } from "@/packages/infrastructure/http/http-request-input";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import {
    ListWantedItemsQuery,
    type ListWantedItemsOptions,
} from "../../application/list-wanted-items/list-wanted-items.query";

export type ListWantedItemsInput = ListWantedItemsOptions & {
    accountId: number;
};

export class ListWantedItemsHttpController implements HttpController {
    static readonly PATH = "/accounts/:accountId/wanted-items";

    constructor(
        httpServer: HttpServer,
        private readonly queryBus: QueryBus,
        private readonly validator: Validator<ListWantedItemsInput>,
        doc: HttpRouteDoc,
    ) {
        httpServer.get(ListWantedItemsHttpController.PATH, (request) => this.handle(request), {
            input: validator,
            doc,
        });
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const input = this.validator.validate(HttpRequestInput.fromQuery(request));
        const body = await this.queryBus.ask(new ListWantedItemsQuery(input));
        return { status: HttpStatus.OK, body };
    }
}
