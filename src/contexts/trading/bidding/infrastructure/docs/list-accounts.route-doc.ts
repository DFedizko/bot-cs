import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/infrastructure/http/docs/http-error.response-docs";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import { ACCOUNTS_TAG } from "./accounts.tag";
import { ACCOUNTS_LIST } from "./accounts.example";
import { UNKNOWN_CURRENCY } from "./currency.error-examples";

export const listAccountsDoc = (body: Validator<unknown>): HttpRouteDoc => ({
    summary: "List the accounts",
    description:
        "Lists the CSGOEmpire accounts the bot trades for, in the order they were synchronized, with each one's balance in coin cents: the total, what open bids and trades reserve, and what is left to bid with. An account's id is the accountId of its other routes.\n\nAsk for another `currency` (`USD`, `EUR` or `GBP`) to get every amount in its minor units (cents), converted at fixed rates and rounded half up, each on its own, with the `currency` named at the top. Without it, the amounts are coin cents and no `currency` is named.",
    tags: [ACCOUNTS_TAG],
    responses: [
        {
            status: HttpStatus.OK,
            description: "Every account the bot trades for",
            body,
            examples: { accounts: { summary: "A bot that trades for two accounts", value: ACCOUNTS_LIST } },
        },
        HttpErrorResponseDocs.badQuery(UNKNOWN_CURRENCY),
        HttpErrorResponseDocs.internalError(),
    ],
});
