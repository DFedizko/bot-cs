import type { Primitive } from "@/packages/building-blocks/value-object";
import type { AuctionParticipationRepository } from "../../application/auction-participation.repository";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { AuctionId } from "../../domain/auction-participation/auction-id";
import { AuctionParticipation } from "../../domain/auction-participation/auction-participation";

export class AuctionParticipationRepositoryInMemory implements AuctionParticipationRepository {
    private readonly store = new Map<Primitive<AuctionId>, AuctionParticipation>();

    async findByAuctionId(auctionId: AuctionId): Promise<AuctionParticipation | undefined> {
        return this.store.get(auctionId.getValue());
    }

    async findManyByAccountId(accountId: AccountId): Promise<AuctionParticipation[]> {
        return Array.from(
            this.store
                .values()
                .filter((auctionParticipation) => auctionParticipation.getAccountId() === accountId.getValue()),
        );
    }

    async save(auctionParticipation: AuctionParticipation): Promise<void> {
        this.store.set(auctionParticipation.getId(), auctionParticipation);
    }

    async removeByAuctionId(auctionId: AuctionId): Promise<void> {
        this.store.delete(auctionId.getValue());
    }
}
