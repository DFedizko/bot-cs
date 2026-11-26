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
import type {
    ListWantedItemsResponse,
    WantedItemDto,
} from "../../application/list-wanted-items/list-wanted-items.response";
import type { UserCurrency } from "../currency/user-currency";
import type { UserCurrencyConverter } from "../currency/user-currency.converter";

export type ListWantedItemsInput = ListWantedItemsOptions & {
    accountId: number;
    currency?: UserCurrency;
};

export type ListWantedItemsBody = ListWantedItemsResponse & {
    currency?: UserCurrency;
};

export class ListWantedItemsHttpController implements HttpController {
    static readonly PATH = "/accounts/:accountId/wanted-items";

    constructor(
        httpServer: HttpServer,
        private readonly queryBus: QueryBus,
        private readonly validator: Validator<ListWantedItemsInput>,
        private readonly converter: UserCurrencyConverter,
        doc: HttpRouteDoc,
    ) {
        httpServer.get(ListWantedItemsHttpController.PATH, (request) => this.handle(request), {
            input: validator,
            doc,
        });
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { currency, ...input } = this.validator.validate(HttpRequestInput.fromQuery(request));
        const wantedItems = await this.queryBus.ask(new ListWantedItemsQuery(input));
        const body = currency ? this.showIn(wantedItems, currency) : wantedItems;
        return { status: HttpStatus.OK, body };
    }

    private showIn(wantedItems: ListWantedItemsResponse, currency: UserCurrency): ListWantedItemsBody {
        const items = wantedItems.items.map((item) => this.showItemIn(item, currency));
        return { ...wantedItems, items, currency };
    }

    private showItemIn(item: WantedItemDto, currency: UserCurrency): WantedItemDto {
        return { ...item, maxFor: this.converter.showMaxFor(item.maxFor, currency) };
    }
}
