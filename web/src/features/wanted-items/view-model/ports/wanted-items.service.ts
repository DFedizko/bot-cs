import { definePort } from "@/shared/lib/define-port";
import type { WantedItemsPage } from "../../model/wanted-items-page";
import type { WantedItemsQuery } from "../../model/wanted-items-query";

const WANTED_ITEMS_SERVICE_PORT = "WantedItemsService";

export interface WantedItemsService {
    list: (accountId: string, query: WantedItemsQuery) => Promise<WantedItemsPage>;
    setEnabled: (accountId: string, name: string, enabled: boolean) => Promise<void>;
}

export const { Provider: WantedItemsServiceProvider, usePort: useWantedItemsService } =
    definePort<WantedItemsService>(WANTED_ITEMS_SERVICE_PORT);
