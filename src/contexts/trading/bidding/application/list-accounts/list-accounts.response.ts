export type AccountBalanceDto = {
    total: number;
    reserved: number;
    available: number;
};

export type AccountDto = {
    id: string;
    name: string;
    balance: AccountBalanceDto;
};

export type ListAccountsResponse = {
    readonly items: AccountDto[];
};
