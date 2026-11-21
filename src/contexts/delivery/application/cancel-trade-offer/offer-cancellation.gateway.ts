export interface OfferCancellationGateway {
    cancel(accountId: number, offerId: string): Promise<void>;
}
