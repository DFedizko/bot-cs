export const ACCEPT_OUTCOME = {
    ACCEPTED: "accepted",
    NEEDS_CONFIRMATION: "needs_confirmation",
    ON_HOLD: "on_hold",
} as const;

export type AcceptOutcome = (typeof ACCEPT_OUTCOME)[keyof typeof ACCEPT_OUTCOME];

export interface OfferAcceptanceGateway {
    accept(accountId: number, offerId: string): Promise<AcceptOutcome>;
}
