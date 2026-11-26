import { IntegrationEvent } from "@/packages/building-blocks/integration-event";

export type ItemSoldPayload = {
    accountId: number;
    depositId: number;
    assetId: string;
    appId: number;
    marketHashName: string;
    buyerSteamId: string;
    tradeUrl: string;
    deadline: string;
};

export class ItemSoldEvent extends IntegrationEvent<ItemSoldPayload> {
    static readonly EVENT_NAME = "item_sold";

    constructor(payload: ItemSoldPayload) {
        super({ name: ItemSoldEvent.EVENT_NAME, payload });
    }
}
