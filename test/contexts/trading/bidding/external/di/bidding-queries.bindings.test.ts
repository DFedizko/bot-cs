import type { Container } from "inversify";
import { biddingContainer } from "./__builders__/bidding-container.builder";
import { QUERY_BUS } from "@/packages/external/di/packages.identifiers";
import {
    ACCOUNTS_DAO,
    CATALOG_DETAILS_GATEWAY,
    LIST_ACCOUNTS_HANDLER,
    LIST_WANTED_ITEMS_HANDLER,
    WANTED_ITEMS_DAO,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { CatalogDetailsGatewayAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/catalog-details.gateway.adapter";
import { WantedItemsDaoInMemory } from "@/contexts/trading/bidding/infrastructure/daos/wanted-items.dao.in-memory";
import { AccountsDaoInMemory } from "@/contexts/trading/bidding/infrastructure/daos/accounts.dao.in-memory";
import { ListWantedItemsQueryHandler } from "@/contexts/trading/bidding/application/list-wanted-items/list-wanted-items.query-handler";
import { ListAccountsQueryHandler } from "@/contexts/trading/bidding/application/list-accounts/list-accounts.query-handler";
import { ListAccountsQuery } from "@/contexts/trading/bidding/application/list-accounts/list-accounts.query";

const ENVIRONMENTS: ("development" | "production")[] = ["development", "production"];
const BINDINGS = [
    { identifier: CATALOG_DETAILS_GATEWAY, implementation: CatalogDetailsGatewayAdapter },
    { identifier: WANTED_ITEMS_DAO, implementation: WantedItemsDaoInMemory },
    { identifier: ACCOUNTS_DAO, implementation: AccountsDaoInMemory },
    { identifier: LIST_WANTED_ITEMS_HANDLER, implementation: ListWantedItemsQueryHandler },
    { identifier: LIST_ACCOUNTS_HANDLER, implementation: ListAccountsQueryHandler },
];

let container: Container;

describe.each(ENVIRONMENTS)("bindBiddingQueries in %s", (nodeEnv) => {
    beforeEach(() => {
        container = biddingContainer(nodeEnv);
    });

    it.each(BINDINGS)("Should bind the $implementation.name", ({ identifier, implementation }) => {
        const bound = container.get(identifier);

        expect(bound).toBeInstanceOf(implementation);
    });

    it("Should register the list accounts handler on the query bus", async () => {
        const response = await container.get(QUERY_BUS).ask(new ListAccountsQuery());

        expect(response).toEqual({ items: [] });
    });
});
