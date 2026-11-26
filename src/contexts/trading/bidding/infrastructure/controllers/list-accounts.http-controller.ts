import type { QueryBus } from "@/packages/application/query-bus";
import type { HttpController } from "@/packages/infrastructure/http/http-controller";
import type { HttpRequest, HttpResponse, HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpRequestInput } from "@/packages/infrastructure/http/http-request-input";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { ListAccountsQuery } from "../../application/list-accounts/list-accounts.query";
import type { AccountDto, ListAccountsResponse } from "../../application/list-accounts/list-accounts.response";
import type { UserCurrency } from "../currency/user-currency";
import type { UserCurrencyConverter } from "../currency/user-currency.converter";

export type ListAccountsInput = {
    currency?: UserCurrency;
};

export type ListAccountsBody = ListAccountsResponse & ListAccountsInput;

export class ListAccountsHttpController implements HttpController {
    static readonly PATH = "/accounts";

    constructor(
        httpServer: HttpServer,
        private readonly queryBus: QueryBus,
        private readonly validator: Validator<ListAccountsInput>,
        private readonly converter: UserCurrencyConverter,
        doc: HttpRouteDoc,
    ) {
        httpServer.get(ListAccountsHttpController.PATH, (request) => this.handle(request), { input: validator, doc });
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        const { currency } = this.validator.validate(HttpRequestInput.fromQuery(request));
        const accounts = await this.queryBus.ask(new ListAccountsQuery());
        const body = currency ? this.showIn(accounts, currency) : accounts;
        return { status: HttpStatus.OK, body };
    }

    private showIn({ items }: ListAccountsResponse, currency: UserCurrency): ListAccountsBody {
        return { items: items.map((account) => this.showAccountIn(account, currency)), currency };
    }

    private showAccountIn(account: AccountDto, currency: UserCurrency): AccountDto {
        const show = (coinCents: number) => this.converter.fromCoinCents(coinCents, currency);
        const { total, reserved, available } = account.balance;
        return { ...account, balance: { total: show(total), reserved: show(reserved), available: show(available) } };
    }
}
