import type { Container } from "inversify";
import { LeaveAuctionCommand } from "@/contexts/trading/bidding/application/leave-auction/leave-auction.command";
import { AuctionId } from "@/contexts/trading/bidding/domain/auction-participation/auction-id";
import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";
import { testContainer } from "@/__builders__/test-container.builder";
import {
    AUCTION_PARTICIPATION_REPO,
    LEAVE_AUCTION_HANDLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let container: Container;

describe("LeaveAuctionCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should leave auction by auction id", async () => {
        const auctionParticipationRepository = container.get(AUCTION_PARTICIPATION_REPO);
        await auctionParticipationRepository.save(
            AuctionParticipation.create({ accountId: 1, auctionId: 1, maxBid: 200 }),
        );

        await container.get(LEAVE_AUCTION_HANDLER).handle(new LeaveAuctionCommand(1));

        const auctionParticipation = await auctionParticipationRepository.findByAuctionId(new AuctionId(1));
        expect(auctionParticipation).toBe(undefined);
    });
});
