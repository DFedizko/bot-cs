import type { OutbidEvent } from "@/contexts/trading/bidding/application/track-auction-update/outbid.event";
import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import type { Logger } from "@/packages/application/logger";
import type { Mock } from "bun:test";
import { outbidEvent } from "../track-auction-update/__mocks__/outbid.event.mock";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import { BidIncrementer } from "@/contexts/trading/bidding/domain/bid-incrementer";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";
import { CommandBusInMemory } from "@/packages/infrastructure/command-bus/command-bus.in-memory";
import { OnOutbidCounterBid } from "@/contexts/trading/bidding/application/place-bid/on-outbid-counter-bid";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import type { AuctionParticipationRepository } from "@/contexts/trading/bidding/application/auction-participation.repository";
import { AuctionParticipationRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/auction-participation.repository.in-memory";
import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";
import { AuctionId } from "@/contexts/trading/bidding/domain/auction-participation/auction-id";
import { LeaveAuctionCommand } from "@/contexts/trading/bidding/application/leave-auction/leave-auction.command";

let auctionParticipationRepo: AuctionParticipationRepository;
let auctionParticipationFindSpy: Mock<AuctionParticipationRepository["findByAuctionId"]>;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let commandBus: CommandBus;
let dispatchSpy: Mock<CommandBus["dispatch"]>;
let onOutbidCounterBid: EventListener<OutbidEvent>;
describe("OnOutbidCounterBid", () => {
    beforeEach(() => {
        auctionParticipationRepo = new AuctionParticipationRepositoryInMemory();
        auctionParticipationFindSpy = jest.spyOn(auctionParticipationRepo, "findByAuctionId");
        logger = new LoggerConsoleAdapter();
        loggerSpy = jest.spyOn(logger, "log");
        commandBus = new CommandBusInMemory();
        dispatchSpy = jest.spyOn(commandBus, "dispatch");
        commandBus.register({ handle: async () => {}, subscribedTo: () => PlaceBidCommand.COMMAND_NAME });
        commandBus.register({ handle: async () => {}, subscribedTo: () => LeaveAuctionCommand.COMMAND_NAME });
        onOutbidCounterBid = new OnOutbidCounterBid(auctionParticipationRepo, logger, commandBus);
    });

    it("Should dispatch a command to place a bid on outbid", async () => {
        const outbid = outbidEvent();
        await auctionParticipationRepo.save(
            AuctionParticipation.create({
                auctionId: outbid.payload.auctionId,
                accountId: 2,
                maxBid: 3766,
            }),
        );
        await onOutbidCounterBid.on(outbid);
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
        await onOutbidCounterBid.on(outbid);
        expect(loggerSpy).toHaveBeenCalledWith(
            `No participation was found by the auction id "${outbid.payload.auctionId}"`,
        );
        expect(dispatchSpy).not.toHaveBeenCalled();
    });
    it("Shouldn't counter bid when the next bid value is less than the maximum bid value and dispatch a leave auction command", async () => {
        const outbid = outbidEvent({ bidValue: 3766 });
        await auctionParticipationRepo.save(
            AuctionParticipation.create({
                auctionId: outbid.payload.auctionId,
                accountId: 2,
                maxBid: 3765,
            }),
        );
        await onOutbidCounterBid.on(outbid);
        const [command] = dispatchSpy.mock.calls[0] as [LeaveAuctionCommand];
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(
            `The next bid value (${CoinCent(3804).format()}) is bigger than the max bid value for this item (${CoinCent(3765).format()})`,
        );
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(command.auctionId).toBe(outbid.payload.auctionId);
    });
});
