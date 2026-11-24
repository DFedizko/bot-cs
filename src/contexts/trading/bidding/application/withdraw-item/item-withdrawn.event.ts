import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type ItemWithdrawnPayload = {
    itemId: number;
    accountId: number;
    value: number;
    tradeId: number;
    tradeOfferId: number;
};

export class ItemWithdrawnEvent extends ApplicationEvent<ItemWithdrawnPayload> {
    static readonly EVENT_NAME = "item_withdrawn";

    constructor(payload: ItemWithdrawnPayload) {
        super({ name: ItemWithdrawnEvent.EVENT_NAME, payload });
    }
}
