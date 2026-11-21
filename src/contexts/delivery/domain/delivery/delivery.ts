import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { AccountId } from "./account-id";
import { DeliveryFailureReason } from "./delivery-failure-reason";
import { ALLOWED_TRANSITIONS, DeliveryStatus } from "./delivery-status";
import { ExpectedItem, type ExpectedItemProps } from "./expected-item";
import { InvalidDeliveryTransitionError } from "./errors/invalid-delivery-transition.error";
import { MissingAcceptedOfferError } from "./errors/missing-accepted-offer.error";
import { SteamId } from "./steam-id";
import { TradeId } from "./trade-id";
import { TradeOfferId } from "./trade-offer-id";
import type { DeliveryIdentity } from "./events/delivery-identity";
import { DeliveryStartedEvent } from "./events/delivery-started.event";
import { TradeOfferAcceptedEvent } from "./events/trade-offer-accepted.event";
import { DeliveryConfirmedEvent } from "./events/delivery-confirmed.event";
import { DeliveryReceivedEvent } from "./events/delivery-received.event";
import { DeliveryDisputedEvent } from "./events/delivery-disputed.event";
import { DeliveryFailedEvent } from "./events/delivery-failed.event";
import { DeliveryCancelledEvent } from "./events/delivery-cancelled.event";

export type DeliveryProps = {
    tradeId: number;
    tradeOfferId: number;
    accountId: number;
    expectedItem: ExpectedItemProps;
    sellerSteamId?: string;
};

export type DeliveryPrimitives = DeliveryProps & {
    status: DeliveryStatus;
    acceptedOfferId?: string;
    needsConfirmation: boolean;
};

const OFFER_TAKING_STATUSES = [DeliveryStatus.AWAITING_OFFER, DeliveryStatus.DISPUTED];

export class Delivery extends AggregateRoot<TradeId> {
    private status = DeliveryStatus.AWAITING_OFFER;
    private acceptedOfferId?: string;
    private confirmationNeeded = false;

    private constructor(
        id: TradeId,
        private readonly tradeOfferId: TradeOfferId,
        private readonly accountId: AccountId,
        private readonly expectedItem: ExpectedItem,
        private readonly sellerSteamId?: SteamId,
    ) {
        super(id);
    }

    static start(props: DeliveryProps): Delivery {
        const delivery = new Delivery(
            new TradeId(props.tradeId),
            new TradeOfferId(props.tradeOfferId),
            new AccountId(props.accountId),
            ExpectedItem.create(props.expectedItem),
            props.sellerSteamId === undefined ? undefined : new SteamId(props.sellerSteamId),
        );
        delivery.record(new DeliveryStartedEvent(delivery.id, delivery.identify()));
        return delivery;
    }

    getTradeId(): number {
        return this.id.getValue();
    }

    getTradeOfferId(): number {
        return this.tradeOfferId.getValue();
    }

    getAccountId(): number {
        return this.accountId.getValue();
    }

    getStatus(): DeliveryStatus {
        return this.status;
    }

    getExpectedItem(): ExpectedItem {
        return this.expectedItem;
    }

    getSellerSteamId(): string | undefined {
        return this.sellerSteamId?.getValue();
    }

    getAcceptedOfferId(): string | undefined {
        return this.acceptedOfferId;
    }

    canTakeOffers(): boolean {
        return OFFER_TAKING_STATUSES.includes(this.status);
    }

    canBeDisputed(): boolean {
        return this.status === DeliveryStatus.AWAITING_OFFER;
    }

    canBeConfirmed(): boolean {
        return this.status === DeliveryStatus.OFFER_ACCEPTED;
    }

    canBeMarkedReceived(): boolean {
        return this.status === DeliveryStatus.CONFIRMED;
    }

    needsConfirmation(): boolean {
        return this.confirmationNeeded;
    }

    acceptOffer(offerId: string, needsConfirmation: boolean): void {
        this.moveTo(DeliveryStatus.OFFER_ACCEPTED);
        this.acceptedOfferId = offerId;
        this.confirmationNeeded = needsConfirmation;
        this.record(new TradeOfferAcceptedEvent(this.id, { ...this.identify(), offerId, needsConfirmation }));
    }

    holdOffer(offerId: string): void {
        this.moveTo(DeliveryStatus.FAILED);
        this.acceptedOfferId = offerId;
        this.recordFailure(DeliveryFailureReason.TRADE_HOLD);
    }

    confirm(): void {
        this.moveTo(DeliveryStatus.CONFIRMED);
        this.record(new DeliveryConfirmedEvent(this.id, { ...this.identify(), offerId: this.offerId() }));
    }

    markReceived(): void {
        this.moveTo(DeliveryStatus.RECEIVED);
        this.record(new DeliveryReceivedEvent(this.id, { ...this.identify(), offerId: this.offerId() }));
    }

    dispute(): void {
        this.moveTo(DeliveryStatus.DISPUTED);
        this.record(new DeliveryDisputedEvent(this.id, this.identify()));
    }

    fail(reason: DeliveryFailureReason): void {
        this.moveTo(DeliveryStatus.FAILED);
        this.recordFailure(reason);
    }

    cancel(): void {
        this.moveTo(DeliveryStatus.CANCELLED);
        this.record(new DeliveryCancelledEvent(this.id, this.identify()));
    }

    toPrimitives(): DeliveryPrimitives {
        return {
            ...this.identify(),
            expectedItem: this.expectedItem.toPrimitives(),
            sellerSteamId: this.getSellerSteamId(),
            status: this.status,
            acceptedOfferId: this.acceptedOfferId,
            needsConfirmation: this.confirmationNeeded,
        };
    }

    private identify(): DeliveryIdentity {
        return { tradeId: this.getTradeId(), tradeOfferId: this.getTradeOfferId(), accountId: this.getAccountId() };
    }

    private offerId(): string {
        if (this.acceptedOfferId === undefined) throw new MissingAcceptedOfferError(this.getTradeId());
        return this.acceptedOfferId;
    }

    private recordFailure(reason: DeliveryFailureReason): void {
        this.record(new DeliveryFailedEvent(this.id, { ...this.identify(), offerId: this.acceptedOfferId, reason }));
    }

    private moveTo(next: DeliveryStatus): void {
        if (!ALLOWED_TRANSITIONS[this.status].includes(next))
            throw new InvalidDeliveryTransitionError(this.status, next);
        this.status = next;
    }
}
