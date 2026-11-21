import type { TradeStatusEvent } from "@/contexts/delivery/infrastructure/ws/csgoempire/trade-status";
import type { TradeWithdrawal } from "@/contexts/delivery/infrastructure/http/csgoempire/types/trade-withdrawal";
import { tradeWithdrawal } from "../../../external/http/csgoempire/__mocks__/trade-withdrawal.mock";

type StatusChange = Pick<TradeWithdrawal, "status" | "status_message">;

export const TERMINAL_STATUSES: StatusChange[] = [
    { status: 6, status_message: "Completed" },
    { status: 7, status_message: "Declined" },
    { status: 8, status_message: "Canceled" },
    { status: 9, status_message: "Timed Out" },
    { status: 11, status_message: "Disputed" },
    { status: -1, status_message: "Error" },
    { status: 13, status_message: "CompletedButReversible" },
    { status: 14, status_message: "TradeReversed" },
    { status: 15, status_message: "TimedOutButReversible" },
];

export const SENDING = { status: 3, status_message: "Sending" } as const;

export const tradeStatus = (overrides: Partial<TradeWithdrawal> = {}): TradeStatusEvent => [
    { type: "withdrawal", data: tradeWithdrawal(overrides) },
];

export const depositStatus = (): TradeStatusEvent => [{ type: "deposit", data: tradeWithdrawal() }];
