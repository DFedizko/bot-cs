import type { Logger } from "@/packages/application/logger";
import type {
    AcceptOutcome,
    SteamTradeOffersGateway,
    TradeOfferDTO,
} from "../../application/accept-delivery-offer/steam-trade-offers.gateway";

const DRY_RUN_OUTCOME: AcceptOutcome = "accepted";

export class SteamTradeOffersGatewayDryRunAdapter implements SteamTradeOffersGateway {
    constructor(
        private readonly gateway: SteamTradeOffersGateway,
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
