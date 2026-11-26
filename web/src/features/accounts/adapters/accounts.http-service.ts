import type { paths } from "@/shared/api/bot-api";
import type { HttpClient } from "@/shared/lib/http/http-client";
import type { Account } from "../model/account";
import type { AccountsService } from "../ports/accounts.service";

type AccountsBody = paths["/accounts"]["get"]["responses"][200]["content"]["application/json"];
type AccountBody = AccountsBody["items"][number];

const ACCOUNTS_PATH = "/accounts";

const toAccount = ({ id, name, balance }: AccountBody): Account => ({ id, name, balance: balance.total });

export class AccountsHttpService implements AccountsService {
    constructor(private readonly http: HttpClient) {}

    async list(): Promise<Array<Account>> {
        const { items } = await this.http.get<AccountsBody>(ACCOUNTS_PATH);
        return items.map(toAccount);
    }
}
