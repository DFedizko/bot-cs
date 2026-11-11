import { AggregateRoot } from "@/packages/building-blocks/aggregate-root";
import { AuctionId } from "./auction-id";
import { MaxBid } from "./max-bid";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import { AccountId } from "../account/account-id";

export class AuctionParticipation extends AggregateRoot<AuctionId> {
    private constructor(
        id: AuctionId,
        private readonly accountId: AccountId,
        private readonly maxBid: MaxBid,
    ) {
        super(id);
    }

    static create(props: { auctionId: number; accountId: number; maxBid: number }): AuctionParticipation {
        return new AuctionParticipation(
            new AuctionId(props.auctionId),
            new AccountId(props.accountId),
            CoinCent(props.maxBid),
        );
    }

    getId(): number {
        return this.id.getValue();
    }

    getAccountId(): number {
        return this.accountId.getValue();
    }

    getMaxBid(): number {
        return this.maxBid.getAmount();
    }
}
