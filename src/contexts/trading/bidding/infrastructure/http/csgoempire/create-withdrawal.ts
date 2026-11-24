export namespace CreateWithdrawal {
    export interface Request {
        deposit_id: number;
        coin_value: number;
    }
    export type Body = Pick<Request, "coin_value">;
    export interface Response {
        success: true;
        data: CreateWithdrawalData;
    }
    export type ErrorResponse = Record<string, never>;
}

interface CreateWithdrawalData {
    id: number;
    tradeoffer_id: number;
}
