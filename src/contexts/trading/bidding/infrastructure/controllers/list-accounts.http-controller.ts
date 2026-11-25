import type { QueryBus } from "@/packages/application/query-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { ListAccountsQuery } from "../../application/list-accounts/list-accounts.query";

export class ListAccountsHttpController implements HttpController {
    static readonly PATH = "/accounts";

    constructor(
        httpServer: HttpServer,
        private readonly queryBus: QueryBus,
        doc: HttpRouteDoc,
    ) {
        httpServer.get(ListAccountsHttpController.PATH, () => this.handle(), { doc });
    }

    async handle(): Promise<HttpResponse> {
        const body = await this.queryBus.ask(new ListAccountsQuery());
        return { status: HttpStatus.OK, body };
    }
}
