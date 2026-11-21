import type { Container } from "inversify";
import { HTTP_SERVER, LOGGER } from "@/packages/external/di/packages.identifiers";
import { freePort } from "@/packages/external/http/__builders__/free-port.builder";
import {
    ADD_WANTED_ITEM_CONTROLLER,
    EDIT_WANTED_ITEM_CONTROLLER,
    REMOVE_WANTED_ITEM_CONTROLLER,
    TOGGLE_WANTED_ITEM_CONTROLLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

type ApiResponse = { status: number; body: string };

export type WantedItemsApi = {
    send(method: string, path: string, body?: unknown): Promise<ApiResponse>;
};

const WANTED_ITEM_CONTROLLERS = [
    ADD_WANTED_ITEM_CONTROLLER,
    EDIT_WANTED_ITEM_CONTROLLER,
    REMOVE_WANTED_ITEM_CONTROLLER,
    TOGGLE_WANTED_ITEM_CONTROLLER,
];

const JSON_HEADERS = { "content-type": "application/json" };

export const itemPath = (accountId: number | string, itemName: string): string =>
    `/accounts/${accountId}/wanted-items/${encodeURIComponent(itemName)}`;

export const enabledPath = (accountId: number | string, itemName: string): string =>
    `${itemPath(accountId, itemName)}/enabled`;

export const itemsPath = (accountId: number | string): string => `/accounts/${accountId}/wanted-items`;

export const startWantedItemsApi = async (container: Container): Promise<WantedItemsApi> => {
    jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    await Promise.all(WANTED_ITEM_CONTROLLERS.map((id) => container.getAsync(id)));
    const port = freePort();
    container.get(HTTP_SERVER).listen(port);
    return {
        send: async (method, path, body) => {
            const init =
                body === undefined ? { method } : { method, headers: JSON_HEADERS, body: JSON.stringify(body) };
            const response = await fetch(`http://localhost:${port}${path}`, init);
            return { status: response.status, body: await response.text() };
        },
    };
};
