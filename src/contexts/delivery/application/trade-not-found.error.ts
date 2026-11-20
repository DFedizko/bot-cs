import { BaseError } from "@/packages/building-blocks/base-error";

export class TradeNotFoundError extends BaseError {
    constructor(tradeId: number) {
        super({ message: `CSGOEmpire has no trade "${tradeId}"`, code: "TRADE_NOT_FOUND" });
    }
}
