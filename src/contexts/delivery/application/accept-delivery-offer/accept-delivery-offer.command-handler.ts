import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { Delivery } from "../../domain/delivery/delivery";
import { OfferVerificationPolicy } from "../../domain/offer-verification/offer-verification-policy";
import type { OfferVerdict } from "../../domain/offer-verification/offer-verdict";
import { ReceivedOffer } from "../../domain/offer-verification/received-offer";
import type { DeliveryRepository } from "../delivery.repository";
import { TradeId } from "../../domain/delivery/trade-id";
import { ACCEPT_OUTCOME, type AcceptOutcome, type OfferAcceptanceGateway } from "./offer-acceptance.gateway";
import type { ReceivedOffersGateway } from "./received-offers.gateway";
import { AcceptDeliveryOfferCommand } from "./accept-delivery-offer.command";
import { DeliveryOfferNotFoundEvent } from "./delivery-offer-not-found.event";
import { ScamOffersFoundEvent } from "./scam-offers-found.event";

const SINGLE_MATCH = 1;

export class AcceptDeliveryOfferCommandHandler implements CommandHandler<AcceptDeliveryOfferCommand> {
    constructor(
        private readonly repository: DeliveryRepository,
        private readonly receivedOffers: ReceivedOffersGateway,
        private readonly offerAcceptance: OfferAcceptanceGateway,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return AcceptDeliveryOfferCommand.COMMAND_NAME;
    }

    async handle(command: AcceptDeliveryOfferCommand): Promise<void> {
        const delivery = await this.repository.getByTradeId(new TradeId(command.tradeId));
        if (!delivery.canTakeOffers())
            return this.logger.log(
                `Delivery of trade "${command.tradeId}" is ${delivery.getStatus()}, nothing to accept`,
            );
        const verdicts = await this.verifyReceivedOffers(delivery);
        await this.reportScamOffers(delivery, verdicts);
        verdicts.filter((verdict) => !verdict.isAccepted()).forEach((verdict) => this.logRejection(delivery, verdict));
        const matching = verdicts.filter((verdict) => verdict.isAccepted());
        if (matching.length !== SINGLE_MATCH) return this.reportNoMatch(delivery, matching.length);
        await this.acceptOffer(delivery, matching[0].getOfferId());
    }

    private async verifyReceivedOffers(delivery: Delivery): Promise<OfferVerdict[]> {
        const offers = await this.receivedOffers.listReceivedActive(delivery.getAccountId());
        const policy = OfferVerificationPolicy.forDelivery(delivery);
        return offers.map((offer) => policy.verify(ReceivedOffer.create(offer)));
    }

    private async reportScamOffers(delivery: Delivery, verdicts: OfferVerdict[]): Promise<void> {
        const scams = verdicts.filter((verdict) => verdict.shouldBeCancelled());
        if (scams.length === 0) return;
        await this.eventBus.publish([
            new ScamOffersFoundEvent({
                tradeId: delivery.getTradeId(),
                accountId: delivery.getAccountId(),
                offers: scams.map((verdict) => ({ offerId: verdict.getOfferId(), reasons: [...verdict.getReasons()] })),
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
        await this.eventBus.publish([
            new DeliveryOfferNotFoundEvent({
                tradeId: delivery.getTradeId(),
                accountId: delivery.getAccountId(),
                matchingOffers,
            }),
        ]);
    }

    private async acceptOffer(delivery: Delivery, offerId: string): Promise<void> {
        const outcome = await this.offerAcceptance.accept(delivery.getAccountId(), offerId);
        this.recordOutcome(delivery, offerId, outcome);
        await this.repository.save(delivery);
        await this.eventBus.publish(delivery.pullDomainEvents());
        this.logger.log(
            `Accepted offer "${offerId}" for trade "${delivery.getTradeId()}" of account "${delivery.getAccountId()}"`,
        );
    }

    private recordOutcome(delivery: Delivery, offerId: string, outcome: AcceptOutcome): void {
        if (outcome === ACCEPT_OUTCOME.ON_HOLD) return delivery.holdOffer(offerId);
        delivery.acceptOffer(offerId, outcome === ACCEPT_OUTCOME.NEEDS_CONFIRMATION);
    }
}
