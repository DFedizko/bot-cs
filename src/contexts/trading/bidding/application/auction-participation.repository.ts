import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { AuctionId } from "../domain/auction-participation/auction-id";
import { AuctionParticipation } from "../domain/auction-participation/auction-participation";

export interface AuctionParticipationRepository {
    findByAuctionId(auctionId: AuctionId): Promise<AuctionParticipation | undefined>;
    findManyByAccountId(accountId: AccountId): Promise<AuctionParticipation[]>;
    save(auctionParticipation: AuctionParticipation): Promise<void>;
    removeByAuctionId(auctionId: AuctionId): Promise<void>;
}
