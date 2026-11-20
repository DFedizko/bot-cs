export namespace DisputeTrade {
    export interface Request {
        tradeoffer_id: number;
    }
    export interface Response {
        success: true;
    }
    export type ErrorResponse = Record<string, never>;
}
