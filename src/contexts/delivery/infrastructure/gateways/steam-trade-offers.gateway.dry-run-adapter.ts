import type { Logger } from "@/packages/application/logger";
import type {
    ReceivedOffersGateway,
    TradeOfferDTO,
} from "../../application/accept-delivery-offer/received-offers.gateway";
import {
    ACCEPT_OUTCOME,
    type AcceptOutcome,
    type OfferAcceptanceGateway,
} from "../../application/accept-delivery-offer/offer-acceptance.gateway";
import type { OfferConfirmationGateway } from "../../application/confirm-trade-offer/offer-confirmation.gateway";
import type { OfferCancellationGateway } from "../../application/cancel-trade-offer/offer-cancellation.gateway";

const DRY_RUN_OUTCOME: AcceptOutcome = ACCEPT_OUTCOME.ACCEPTED;

export class SteamTradeOffersGatewayDryRunAdapter
    implements ReceivedOffersGateway, OfferAcceptanceGateway, OfferConfirmationGateway, OfferCancellationGateway
{
    constructor(
        private readonly gateway: ReceivedOffersGateway,
        private readonly logger: Logger,
    ) {}

    listReceivedActive(accountId: number): Promise<TradeOfferDTO[]> {
        return this.gateway.listReceivedActive(accountId);
    }

    async accept(accountId: number, offerId: string): Promise<AcceptOutcome> {
        this.logWouldDo("accept", accountId, offerId);
        return DRY_RUN_OUTCOME;
    }

    async cancel(accountId: number, offerId: string): Promise<void> {
        this.logWouldDo("cancel", accountId, offerId);
    }

    async confirm(accountId: number, offerId: string): Promise<void> {
        this.logWouldDo("confirm", accountId, offerId);
    }

    private logWouldDo(action: string, accountId: number, offerId: string): void {
        this.logger.log(`[dry-run] Would ${action} offer "${offerId}" for account "${accountId}"`);
    }
}
