export interface ActiveTradesGateway {
    getActiveTrades(): Promise<ActiveTradesDTO[]>;
}

export type ActiveTradesDTO = {
    itemId: number;
    value: number;
};
