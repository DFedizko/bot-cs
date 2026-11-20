import type { AuctionParticipationRepository } from "@/contexts/trading/bidding/application/auction-participation.repository";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { AuctionId } from "@/contexts/trading/bidding/domain/auction-participation/auction-id";
import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";
import { testContainer } from "@/__builders__/test-container.builder";
import { AUCTION_PARTICIPATION_REPO } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let auctionParticipationRepository: AuctionParticipationRepository;
describe("AuctionParticipationRepositoryInMemory", () => {
    beforeEach(() => {
        auctionParticipationRepository = testContainer().get(AUCTION_PARTICIPATION_REPO);
    });
    it("Should save and find an auction participation by id", async () => {
        await auctionParticipationRepository.save(
            AuctionParticipation.create({ auctionId: 1, accountId: 1, maxBid: 10100 }),
        );
        const auctionParticipation = await auctionParticipationRepository.findByAuctionId(new AuctionId(1));
        expect(auctionParticipation?.getId()).toBe(1);
        expect(auctionParticipation?.getAccountId()).toBe(1);
        expect(auctionParticipation?.getMaxBid()).toBe(10100);
    });
    it("Should return all auction participations from a account", async () => {
        const auctionParticipation1 = AuctionParticipation.create({
            auctionId: 1,
            accountId: 1,
            maxBid: 10100,
        });
        const auctionParticipation2 = AuctionParticipation.create({
            auctionId: 2,
            accountId: 1,
            maxBid: 10100,
        });
        await auctionParticipationRepository.save(auctionParticipation1);
        await auctionParticipationRepository.save(auctionParticipation2);
        const participations = await auctionParticipationRepository.findManyByAccountId(new AccountId(1));
        expect(participations).toMatchObject([auctionParticipation1, auctionParticipation2]);
    });
    it("Should return undefined when an auction participation was not found by the id", async () => {
        const auctionParticipation = await auctionParticipationRepository.findByAuctionId(new AuctionId(1));
        expect(auctionParticipation).toBe(undefined);
    });
    it("Should remove a participation by the auction id", async () => {
        await auctionParticipationRepository.save(
            AuctionParticipation.create({ auctionId: 1, accountId: 1, maxBid: 10100 }),
        );
        await auctionParticipationRepository.removeByAuctionId(new AuctionId(1));
        const auctionParticipation = await auctionParticipationRepository.findByAuctionId(new AuctionId(1));
        const auctionParticipations = await auctionParticipationRepository.findManyByAccountId(new AccountId(1));
        expect(auctionParticipation).toBe(undefined);
        expect(auctionParticipations).toEqual([]);
    });
});
