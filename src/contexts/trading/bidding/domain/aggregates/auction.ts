import { AggregateRoot } from "@aggregate-root";
import { AuctionId } from "../value-objects/auction-id";
import { StartingPrice } from "../value-objects/starting-price";
import { ItemName } from "@/contexts/trading/shared/domain/item-name";
import { ExternalAuctionId } from "../value-objects/external-auction-id";
import { COIN } from "@/shared-kernel/domain/currencies";
import { NumberOfBids } from "../value-objects/number-of-bids";
import { HighestBid } from "../value-objects/highest-bid";
import { AuctionStartedDomainEvent } from "../events/auction-started.domain-event";
import { Percentage } from "@/shared/domain-primitives/percentage";
import { Money } from "@/shared/domain-primitives/money";
import { BidPlacedDomainEvent } from "../events/bid-placed.domain-event";
import { DomainError } from "@/shared/error/domain-error";

type StartAuctionProps = {
    externalId: number;
    startedAt: Date;
    endsAt: Date;
    startingPrice: number;
    itemName: string;
    highestBid?: number;
    numberOfBids?: number;
};

export class Auction extends AggregateRoot<AuctionId> {
    static readonly AUCTION_CURRENCY = COIN;

    private constructor(
        protected readonly id: AuctionId,
        private readonly externalId: ExternalAuctionId,
        private readonly startedAt: Date,
        private readonly endsAt: Date,
        private readonly startingPrice: StartingPrice,
        private readonly itemName: ItemName,
        private numberOfBids = new NumberOfBids(0),
        private highestBid?: HighestBid,
    ) {
        super(AuctionId.create());
    }

    static start(props: StartAuctionProps): Auction {
        if (props.startedAt > props.endsAt)
            throw new DomainError({ message: "The started at date must be less than ends at date" });
        if (props.highestBid && !props.numberOfBids)
            throw new DomainError({
                message: "It is not possible to have the highest bid amount without the number of bids",
            });

        const highestBid = props.highestBid
            ? HighestBid.fromCents({ amount: props.highestBid, currency: this.AUCTION_CURRENCY })
            : undefined;
        const auction = new Auction(
            AuctionId.create(),
            new ExternalAuctionId(props.externalId),
            props.startedAt,
            props.endsAt,
            StartingPrice.fromCents({ amount: props.startingPrice, currency: this.AUCTION_CURRENCY }),
            ItemName.create(props.itemName),
            new NumberOfBids(props?.numberOfBids ?? 0),
            highestBid,
        );
        auction.record(new AuctionStartedDomainEvent(auction.id));
        return auction;
    }

    placeBid(): void {
        const ONE_BID_UNIT = 1;
        const nextBid = this.getNextBid();
        this.highestBid = HighestBid.fromCents({ amount: nextBid, currency: Auction.AUCTION_CURRENCY });
        this.numberOfBids = new NumberOfBids(this.numberOfBids.getValue() + ONE_BID_UNIT);
        this.record(new BidPlacedDomainEvent(this.id));
    }

    private calculateNextBid(): bigint {
        const ONE_UNIT = 1n;
        const highestBidOnePercent = this.highestBid!.percentageOf(Percentage.fromPercent("1"), "HALF_AWAY_FROM_ZERO");
        if (this.highestBid!.getAmount() < 50n) {
            return this.highestBid!.add(
                Money.fromCents({ amount: ONE_UNIT, currency: Auction.AUCTION_CURRENCY }),
            ).getAmount();
        }
        return this.highestBid!.add(highestBidOnePercent).getAmount();
    }

    getId(): string {
        return this.id.getValue();
    }

    getExternalId(): number {
        return this.externalId.getValue();
    }

    getStartedAt(): Date {
        return this.startedAt;
    }

    getEndsAt(): Date {
        return this.endsAt;
    }

    getStartingPrice(): bigint {
        return this.startingPrice.getAmount();
    }

    getItemName(): string {
        return this.itemName.getValue();
    }

    getNumberOfBids(): number {
        return this.numberOfBids.getValue();
    }

    getHighestBid(): bigint | undefined {
        return this.highestBid?.getAmount();
    }

    getNextBid(): bigint {
        return this.hasBid() ? this.calculateNextBid() : this.startingPrice.getAmount();
    }

    private hasBid(): boolean {
        return this.numberOfBids.getValue() > 0;
    }
}
