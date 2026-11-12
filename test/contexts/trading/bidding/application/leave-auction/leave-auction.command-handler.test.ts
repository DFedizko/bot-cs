import type { AuctionParticipationRepository } from "@/contexts/trading/bidding/application/auction-participation.repository";
import { LeaveAuctionCommand } from "@/contexts/trading/bidding/application/leave-auction/leave-auction.command";
import { LeaveAuctionCommandHandler } from "@/contexts/trading/bidding/application/leave-auction/leave-auction.command-handler";
import { AuctionId } from "@/contexts/trading/bidding/domain/auction-participation/auction-id";
import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";
import { AuctionParticipationRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/auction-participation.repository.in-memory";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";

let auctionParticipationRepository: AuctionParticipationRepository;
let leaveAuctionCommandHandler: CommandHandler<LeaveAuctionCommand>;
describe("LeaveAuctionCommandHandler", () => {
    beforeEach(() => {
        auctionParticipationRepository = new AuctionParticipationRepositoryInMemory();
        leaveAuctionCommandHandler = new LeaveAuctionCommandHandler(auctionParticipationRepository);
    });

    it("Should leave auction by auction id", async () => {
        await auctionParticipationRepository.save(
            AuctionParticipation.create({ accountId: 1, auctionId: 1, maxBid: 200 }),
        );
        await leaveAuctionCommandHandler.handle(new LeaveAuctionCommand(1));
        const auctionParticipation = await auctionParticipationRepository.findByAuctionId(new AuctionId(1));
        expect(auctionParticipation).toBe(undefined);
    });
});
