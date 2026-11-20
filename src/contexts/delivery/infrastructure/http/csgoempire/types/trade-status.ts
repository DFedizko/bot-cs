export type TradeStatus = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 13 | 14 | 15;

export type TradeStatusMessage =
    | "Error"
    | "Pending"
    | "Received"
    | "Processing"
    | "Sending"
    | "Confirming"
    | "Sent"
    | "Completed"
    | "Declined"
    | "Canceled"
    | "Timed Out"
    | "Credited"
    | "Disputed"
    | "CompletedButReversible"
    | "TradeReversed"
    | "TimedOutButReversible"
    | (string & {});
