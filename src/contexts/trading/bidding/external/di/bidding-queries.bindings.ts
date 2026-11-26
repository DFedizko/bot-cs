import type { ContainerModuleLoadOptions } from "inversify";
import { QUERY_HANDLER } from "@/packages/external/di/packages.identifiers";
import type { CatalogDetailsGateway } from "../../application/list-wanted-items/catalog-details.gateway";
import type { WantedItemsDao } from "../../application/list-wanted-items/wanted-items.dao";
import type { AccountsDao } from "../../application/list-accounts/accounts.dao";
import { ListWantedItemsQueryHandler } from "../../application/list-wanted-items/list-wanted-items.query-handler";
import { ListAccountsQueryHandler } from "../../application/list-accounts/list-accounts.query-handler";
import type { CatalogLookup } from "@/contexts/catalog";
import { CATALOG_LOOKUP } from "@/contexts/catalog/external/di/catalog.identifiers";
import { CatalogDetailsGatewayAdapter } from "../../infrastructure/gateways/catalog-details.gateway.adapter";
import { WantedItemsDaoInMemory } from "../../infrastructure/daos/wanted-items.dao.in-memory";
import { AccountsDaoInMemory } from "../../infrastructure/daos/accounts.dao.in-memory";
import type { WantedItemStoreInMemory } from "../../infrastructure/stores/wanted-item.store.in-memory";
import type { AccountStoreInMemory } from "../../infrastructure/stores/account.store.in-memory";
import {
    ACCOUNT_STORE,
    ACCOUNTS_DAO,
    CATALOG_DETAILS_GATEWAY,
    LIST_ACCOUNTS_HANDLER,
    LIST_WANTED_ITEMS_HANDLER,
    WANTED_ITEM_STORE,
    WANTED_ITEMS_DAO,
} from "./bidding.identifiers";

const QUERY_HANDLERS = [LIST_WANTED_ITEMS_HANDLER, LIST_ACCOUNTS_HANDLER];

const bindDaos = ({ bind }: ContainerModuleLoadOptions): void => {
    bind(CATALOG_DETAILS_GATEWAY)
        .toResolvedValue((lookup: CatalogLookup) => new CatalogDetailsGatewayAdapter(lookup), [CATALOG_LOOKUP])
        .inSingletonScope();
    bind(WANTED_ITEMS_DAO)
        .toResolvedValue(
            (store: WantedItemStoreInMemory, catalog: CatalogDetailsGateway) =>
                new WantedItemsDaoInMemory(store, catalog),
            [WANTED_ITEM_STORE, CATALOG_DETAILS_GATEWAY],
        )
        .inSingletonScope();
    bind(ACCOUNTS_DAO)
        .toResolvedValue((store: AccountStoreInMemory) => new AccountsDaoInMemory(store), [ACCOUNT_STORE])
        .inSingletonScope();
};

const bindHandlers = ({ bind }: ContainerModuleLoadOptions): void => {
    bind(LIST_WANTED_ITEMS_HANDLER)
        .toResolvedValue((dao: WantedItemsDao) => new ListWantedItemsQueryHandler(dao), [WANTED_ITEMS_DAO])
        .inSingletonScope();
    bind(LIST_ACCOUNTS_HANDLER)
        .toResolvedValue((dao: AccountsDao) => new ListAccountsQueryHandler(dao), [ACCOUNTS_DAO])
        .inSingletonScope();
    QUERY_HANDLERS.forEach((handler) => bind(QUERY_HANDLER).toService(handler));
};

export const bindBiddingQueries = (options: ContainerModuleLoadOptions): void => {
    bindDaos(options);
    bindHandlers(options);
};
