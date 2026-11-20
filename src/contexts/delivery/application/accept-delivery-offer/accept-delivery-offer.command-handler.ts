import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { Delivery } from "../../domain/delivery/delivery";
import { DeliveryStatus } from "../../domain/delivery/delivery-status";
import { OfferVerificationPolicy } from "../../domain/offer-verification/offer-verification-policy";
import type { OfferVerdict } from "../../domain/offer-verification/offer-verdict";
import { ReceivedOffer } from "../../domain/offer-verification/received-offer";
import type { CsgoempireTradesGateway } from "../csgoempire-trades.gateway";
import type { DeliveryRepository } from "../delivery.repository";
import { loadDelivery } from "../load-delivery";
import { AcceptDeliveryOfferCommand } from "./accept-delivery-offer.command";
import { DeliveryFailedEvent } from "./delivery-failed.event";
import { DeliveryOfferNotFoundEvent } from "./delivery-offer-not-found.event";
import { DeliveryReceivedEvent } from "./delivery-received.event";
import { ACCEPT_OUTCOME, type SteamTradeOffersGateway } from "./steam-trade-offers.gateway";
import { TradeOfferAcceptedEvent } from "./trade-offer-accepted.event";
import { TradeOfferCancelledEvent } from "./trade-offer-cancelled.event";

const SINGLE_MATCH = 1;

export class AcceptDeliveryOfferCommandHandler implements CommandHandler<AcceptDeliveryOfferCommand> {
    constructor(
        private readonly repository: DeliveryRepository,
        private readonly steamOffers: SteamTradeOffersGateway,
        private readonly csgoempireTrades: CsgoempireTradesGateway,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return AcceptDeliveryOfferCommand.COMMAND_NAME;
    }

    async handle(command: AcceptDeliveryOfferCommand): Promise<void> {
        const delivery = await loadDelivery(this.repository, command.tradeId);
        if (delivery.canTakeOffers()) return this.findAndAcceptOffer(delivery);
        const acceptedOfferId = delivery.getAcceptedOfferId();
        if (delivery.getStatus() === DeliveryStatus.OFFER_ACCEPTED && acceptedOfferId)
            return this.confirmOffer(delivery, acceptedOfferId);
        if (delivery.getStatus() === DeliveryStatus.CONFIRMED && acceptedOfferId)
            return this.completeDelivery(delivery, acceptedOfferId);
        this.logger.log(`Delivery of trade "${command.tradeId}" is ${delivery.getStatus()}, nothing to accept`);
    }

    private async findAndAcceptOffer(delivery: Delivery): Promise<void> {
        const verdicts = await this.verifyReceivedOffers(delivery);
        await this.cancelScamOffers(delivery, verdicts);
        verdicts.filter((verdict) => !verdict.isAccepted()).forEach((verdict) => this.logRejection(delivery, verdict));
        const matching = verdicts.filter((verdict) => verdict.isAccepted());
        if (matching.length !== SINGLE_MATCH) return this.reportNoMatch(delivery, matching.length);
        await this.acceptOffer(delivery, matching[0].getOfferId());
    }

    private async verifyReceivedOffers(delivery: Delivery): Promise<OfferVerdict[]> {
        const offers = await this.steamOffers.listReceivedActive(delivery.getAccountId());
        const policy = OfferVerificationPolicy.forDelivery(delivery);
        return offers.map((offer) => policy.verify(ReceivedOffer.create(offer)));
    }

    private cancelScamOffers(delivery: Delivery, verdicts: OfferVerdict[]): Promise<void> {
        return verdicts
            .filter((verdict) => verdict.shouldBeCancelled())
            .reduce((previous, verdict) => previous.then(() => this.cancelOffer(delivery, verdict)), Promise.resolve());
    }

    private async cancelOffer(delivery: Delivery, verdict: OfferVerdict): Promise<void> {
        try {
            await this.declineOffer(delivery, verdict);
        } catch (error) {
            this.logger.log(`Couldn't cancel offer "${verdict.getOfferId()}": ${(error as Error).message}`);
        }
    }

    private async declineOffer(delivery: Delivery, verdict: OfferVerdict): Promise<void> {
        await this.steamOffers.cancel(delivery.getAccountId(), verdict.getOfferId());
        this.logger.log(`Cancelled offer "${verdict.getOfferId()}" that asked for our items`);
        await this.eventBus.publish([
            new TradeOfferCancelledEvent({
                ...this.identify(delivery),
                offerId: verdict.getOfferId(),
                reasons: [...verdict.getReasons()],
            }),
        ]);
    }

    private logRejection(delivery: Delivery, verdict: OfferVerdict): void {
        this.logger.log(
            `Rejected offer "${verdict.getOfferId()}" for trade "${delivery.getTradeId()}": ${verdict.getReasons().join(", ")}`,
        );
    }

    private async reportNoMatch(delivery: Delivery, matchingOffers: number): Promise<void> {
        this.logger.log(
            `No single matching offer for trade "${delivery.getTradeId()}" (${matchingOffers} matched), accepting nothing`,
        );
        await this.eventBus.publish([new DeliveryOfferNotFoundEvent({ ...this.identify(delivery), matchingOffers })]);
    }

    private async acceptOffer(delivery: Delivery, offerId: string): Promise<void> {
        const outcome = await this.steamOffers.accept(delivery.getAccountId(), offerId);
        delivery.acceptOffer(offerId);
        if (outcome === ACCEPT_OUTCOME.ON_HOLD) return this.failOnHold(delivery, offerId);
        await this.repository.save(delivery);
        await this.eventBus.publish([new TradeOfferAcceptedEvent({ ...this.identify(delivery), offerId })]);
        this.logger.log(
            `Accepted offer "${offerId}" for trade "${delivery.getTradeId()}" of account "${delivery.getAccountId()}"`,
        );
        if (outcome === ACCEPT_OUTCOME.NEEDS_CONFIRMATION) return this.confirmOffer(delivery, offerId);
        await this.confirmDelivery(delivery, offerId);
    }

    private async failOnHold(delivery: Delivery, offerId: string): Promise<void> {
        delivery.fail();
        await this.repository.save(delivery);
        this.logger.log(`Offer "${offerId}" for trade "${delivery.getTradeId()}" went on hold, delivery failed`);
        await this.eventBus.publish([
            new DeliveryFailedEvent({ ...this.identify(delivery), offerId, reason: ACCEPT_OUTCOME.ON_HOLD }),
        ]);
    }

    private async confirmOffer(delivery: Delivery, offerId: string): Promise<void> {
        await this.steamOffers.confirm(delivery.getAccountId(), offerId);
        await this.confirmDelivery(delivery, offerId);
    }

    private async confirmDelivery(delivery: Delivery, offerId: string): Promise<void> {
        delivery.confirm();
        await this.repository.save(delivery);
        await this.completeDelivery(delivery, offerId);
    }

    private async completeDelivery(delivery: Delivery, offerId: string): Promise<void> {
        await this.csgoempireTrades.markAsReceived(delivery.getTradeOfferId());
        delivery.markReceived();
        await this.repository.save(delivery);
        await this.eventBus.publish([new DeliveryReceivedEvent({ ...this.identify(delivery), offerId })]);
        this.logger.log(`Marked trade "${delivery.getTradeId()}" as received`);
    }

    private identify(delivery: Delivery): { tradeId: number; accountId: number } {
        return { tradeId: delivery.getTradeId(), accountId: delivery.getAccountId() };
    }
}
