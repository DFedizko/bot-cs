export interface WithdrawalGateway {
    withdraw(itemId: number, coinValue: number): Promise<WithdrawalDTO>;
    findWithdrawal(itemId: number): Promise<WithdrawalDTO | undefined>;
}

export type WithdrawalDTO = {
    tradeId: number;
    tradeOfferId: number;
    itemId: number;
    value: number;
};
