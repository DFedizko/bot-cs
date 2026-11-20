import type { Container } from "inversify";
import { outbidEvent } from "../track-auction-update/__mocks__/outbid.event.mock";
import type { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import { BidIncrementer } from "@/contexts/trading/bidding/domain/bid-incrementer";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";
import { AuctionId } from "@/contexts/trading/bidding/domain/auction-participation/auction-id";
import type { LeaveAuctionCommand } from "@/contexts/trading/bidding/application/leave-auction/leave-auction.command";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { AUCTION_PARTICIPATION_REPO, ON_OUTBID } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let container: Container;

describe("OnOutbidCounterBid", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should dispatch a command to place a bid on outbid", async () => {
        const outbid = outbidEvent();
        const auctionParticipationRepo = container.get(AUCTION_PARTICIPATION_REPO);
        await auctionParticipationRepo.save(
            AuctionParticipation.create({
                auctionId: outbid.payload.auctionId,
                accountId: 2,
                maxBid: 3766,
            }),
        );
        const auctionParticipationFindSpy = jest.spyOn(auctionParticipationRepo, "findByAuctionId");
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        const dispatchSpy = jest.spyOn(container.get(COMMAND_BUS), "dispatch").mockResolvedValue();

        await container.get(ON_OUTBID).on(outbid);

        const [placeBidCommand] = dispatchSpy.mock.calls[0] as [PlaceBidCommand];
        expect(auctionParticipationFindSpy).toHaveBeenLastCalledWith(new AuctionId(outbid.payload.auctionId));
        expect(loggerSpy).not.toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(placeBidCommand.auctionId).toBe(outbid.payload.auctionId);
        expect(placeBidCommand.accountId).toBe(outbid.payload.accountId);
        expect(placeBidCommand.bidValue).toBe(BidIncrementer.nextFor(outbid.payload.value));
    });
    it("Shouldn't counter bid when no one auction participation was found", async () => {
        const outbid = outbidEvent();
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        const dispatchSpy = jest.spyOn(container.get(COMMAND_BUS), "dispatch").mockResolvedValue();

        await container.get(ON_OUTBID).on(outbid);

        expect(loggerSpy).toHaveBeenCalledWith(
            `No participation was found by the auction id "${outbid.payload.auctionId}"`,
        );
        expect(dispatchSpy).not.toHaveBeenCalled();
    });
    it("Shouldn't counter bid when the next bid value is less than the maximum bid value and dispatch a leave auction command", async () => {
        const outbid = outbidEvent({ bidValue: 3766 });
        await container.get(AUCTION_PARTICIPATION_REPO).save(
            AuctionParticipation.create({
                auctionId: outbid.payload.auctionId,
                accountId: 2,
                maxBid: 3765,
            }),
        );
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        const dispatchSpy = jest.spyOn(container.get(COMMAND_BUS), "dispatch").mockResolvedValue();

        await container.get(ON_OUTBID).on(outbid);

        const [command] = dispatchSpy.mock.calls[0] as [LeaveAuctionCommand];
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(
            `The next bid value (${CoinCent(3804).format()}) is bigger than the max bid value for this item (${CoinCent(3765).format()})`,
        );
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(command.auctionId).toBe(outbid.payload.auctionId);
    });
});
