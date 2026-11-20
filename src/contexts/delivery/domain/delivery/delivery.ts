import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { AccountId } from "./account-id";
import { ALLOWED_TRANSITIONS, DeliveryStatus } from "./delivery-status";
import { ExpectedItem, type ExpectedItemProps } from "./expected-item";
import { InvalidDeliveryTransitionError } from "./errors/invalid-delivery-transition.error";
import { SteamId } from "./steam-id";
import { TradeId } from "./trade-id";

export type DeliveryProps = {
    tradeId: number;
    accountId: number;
    expectedItem: ExpectedItemProps;
    sellerSteamId?: string;
};

export type DeliveryPrimitives = DeliveryProps & { status: DeliveryStatus; acceptedOfferId?: string };

const OFFER_TAKING_STATUSES = [DeliveryStatus.AWAITING_OFFER, DeliveryStatus.DISPUTED];

export class Delivery extends AggregateRoot<TradeId> {
    private status = DeliveryStatus.AWAITING_OFFER;
    private acceptedOfferId?: string;

    private constructor(
        id: TradeId,
        private readonly accountId: AccountId,
        private readonly expectedItem: ExpectedItem,
        private readonly sellerSteamId?: SteamId,
    ) {
        super(id);
    }

    static start(props: DeliveryProps): Delivery {
        return new Delivery(
            new TradeId(props.tradeId),
            new AccountId(props.accountId),
            ExpectedItem.create(props.expectedItem),
            props.sellerSteamId === undefined ? undefined : new SteamId(props.sellerSteamId),
        );
    }

    getTradeId(): number {
        return this.id.getValue();
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

    acceptOffer(offerId: string): void {
        this.moveTo(DeliveryStatus.OFFER_ACCEPTED);
        this.acceptedOfferId = offerId;
    }

    confirm(): void {
        this.moveTo(DeliveryStatus.CONFIRMED);
    }

    markReceived(): void {
        this.moveTo(DeliveryStatus.RECEIVED);
    }

    dispute(): void {
        this.moveTo(DeliveryStatus.DISPUTED);
    }

    fail(): void {
        this.moveTo(DeliveryStatus.FAILED);
    }

    cancel(): void {
        this.moveTo(DeliveryStatus.CANCELLED);
    }

    toPrimitives(): DeliveryPrimitives {
        return {
            tradeId: this.getTradeId(),
            accountId: this.getAccountId(),
            expectedItem: this.expectedItem.toPrimitives(),
            sellerSteamId: this.getSellerSteamId(),
            status: this.status,
            acceptedOfferId: this.acceptedOfferId,
        };
    }

    private moveTo(next: DeliveryStatus): void {
        if (!ALLOWED_TRANSITIONS[this.status].includes(next))
            throw new InvalidDeliveryTransitionError(this.status, next);
        this.status = next;
    }
}
