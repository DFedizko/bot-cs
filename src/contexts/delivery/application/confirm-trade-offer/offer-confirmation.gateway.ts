export interface OfferConfirmationGateway {
    confirm(accountId: number, offerId: string): Promise<void>;
}
