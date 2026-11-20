import type { AuctionParticipationRepository } from "@/contexts/trading/bidding/application/auction-participation.repository";
import { LeaveAuctionCommand } from "@/contexts/trading/bidding/application/leave-auction/leave-auction.command";
import { AuctionId } from "@/contexts/trading/bidding/domain/auction-participation/auction-id";
import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    AUCTION_PARTICIPATION_REPO,
    LEAVE_AUCTION_HANDLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let auctionParticipationRepository: AuctionParticipationRepository;
let leaveAuctionCommandHandler: CommandHandler<LeaveAuctionCommand>;
describe("LeaveAuctionCommandHandler", () => {
    beforeEach(() => {
        const container = testContainer();
        auctionParticipationRepository = container.get(AUCTION_PARTICIPATION_REPO);
        leaveAuctionCommandHandler = container.get(LEAVE_AUCTION_HANDLER);
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
