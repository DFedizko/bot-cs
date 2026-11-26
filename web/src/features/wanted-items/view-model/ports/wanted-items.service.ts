import { definePort } from "@/shared/lib/define-port";
import type { NewWantedItem } from "../../model/new-wanted-item";
import type { WantedItemsPage } from "../../model/wanted-items-page";
import type { WantedItemsQuery } from "../../model/wanted-items-query";

const WANTED_ITEMS_SERVICE_PORT = "WantedItemsService";

export interface WantedItemsService {
    list: (accountId: string, query: WantedItemsQuery) => Promise<WantedItemsPage>;
    setEnabled: (accountId: string, name: string, enabled: boolean) => Promise<void>;
    add: (accountId: string, item: NewWantedItem) => Promise<void>;
    remove: (accountId: string, name: string) => Promise<void>;
}

export const { Provider: WantedItemsServiceProvider, usePort: useWantedItemsService } =
    definePort<WantedItemsService>(WANTED_ITEMS_SERVICE_PORT);
