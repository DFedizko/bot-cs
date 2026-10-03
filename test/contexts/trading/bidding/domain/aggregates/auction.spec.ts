import { Auction } from "@/contexts/trading/bidding/domain/aggregates/auction";
import { AuctionStartedDomainEvent } from "@/contexts/trading/bidding/domain/events/auction-started.domain-event";
import { BidPlacedDomainEvent } from "@/contexts/trading/bidding/domain/events/bid-placed.domain-event";
import { DomainError } from "@/shared/error/domain-error";

const now = new Date();

beforeEach(() => jest.setSystemTime(now));
afterEach(() => {});

describe("Auction", () => {
    const endsAt = new Date();
    endsAt.setMinutes(endsAt.getMinutes() + 3);
    describe("Creations", () => {
        it("Should start a auction", () => {
            const auction = Auction.start({
                externalId: 288767047,
                startedAt: now,
                endsAt,
                startingPrice: 3656,
                itemName: "M4A4 | Cyber Security (Field-Tested)",
            });
            const events = auction.pullDomainEvents();
            expect(auction.getId()).toBeTypeOf("string");
            expect(auction.getExternalId()).toBe(288767047);
            expect(auction.getStartedAt()).toEqual(now);
            expect(auction.getEndsAt()).toEqual(endsAt);
            expect(auction.getStartingPrice()).toBe(3656n);
            expect(auction.getItemName()).toBe("M4A4 | Cyber Security (Field-Tested)");

            expect(auction.getNumberOfBids()).toBe(0);
            expect(auction.getHighestBid()).toBe(undefined);
            expect(auction.getNextBid()).toBe(3656n);

            expect(events[0]).toBeInstanceOf(AuctionStartedDomainEvent);
            expect(events[0].toPrimitives()).toMatchObject({
                eventId: expect.any(String),
                aggregateId: auction.getId(),
                name: "auction_started",
                ocurredAt: new Date(),
            });
        });
        it("Should throw an error when start an auction with start date bigger than end date", () =>
            expect(() =>
                Auction.start({
                    externalId: 188767047,
                    startedAt: new Date(Date.now() + 1),
                    endsAt: now,
                    startingPrice: 3656,
                    itemName: "M4A4 | Cyber Security (Field-Tested)",
                    highestBid: 3656,
                }),
            ).toThrow(DomainError));
        it("Should throw an error when start an auction with highest bid amount without number of bids", () =>
            expect(() =>
                Auction.start({
                    externalId: 188767047,
                    startedAt: now,
                    endsAt,
                    startingPrice: 3656,
                    itemName: "M4A4 | Cyber Security (Field-Tested)",
                    highestBid: 3656,
                }),
            ).toThrow(DomainError));
        it("Should throw an error when start an auction with more than one bid and highest bid amount is not at least 1 percent or 1 cent higher", () => {
            expect(() =>
                Auction.start({
                    externalId: 188767047,
                    startedAt: now,
                    endsAt,
                    startingPrice: 3656,
                    itemName: "M4A4 | Cyber Security (Field-Tested)",
                    numberOfBids: 2,
                    highestBid: 3692, // highest bid should be 3693 in this case
                }),
            ).toThrow(DomainError);
            expect(() =>
                Auction.start({
                    externalId: 288767049,
                    startedAt: now,
                    endsAt,
                    startingPrice: 48,
                    itemName: "AK-47 | Safari Mesh (Battle-Scarred)",
                    numberOfBids: 3,
                    highestBid: 49, // highest bid should be 50 in this case
                }),
            ).toThrow(DomainError);
        });
    });
    describe("Calculations", () => {
        it("Should increment one percent on the next bid when auction has at least one bid", () => {
            const auction = Auction.start({
                externalId: 288767048,
                startedAt: now,
                endsAt,
                startingPrice: 3656,
                itemName: "M4A4 | Cyber Security (Field-Tested)",
                numberOfBids: 1,
                highestBid: 3656,
            });
            expect(auction.getNextBid()).toBe(3693n);
        });
        it("Should increment one percent more one coincent on the next bid when auction has at least one bid and the price is less than 50 coincents", () => {
            const auction = Auction.start({
                externalId: 288767049,
                startedAt: now,
                endsAt,
                startingPrice: 48,
                itemName: "AK-47 | Safari Mesh (Battle-Scarred)",
                numberOfBids: 1,
                highestBid: 49,
            });
            expect(auction.getNextBid()).toBe(50n);
        });
    });
    describe("Bidding", () => {
        it("Should place a bid", () => {
            const auction = Auction.start({
                externalId: 288767047,
                startedAt: now,
                endsAt,
                startingPrice: 3656,
                itemName: "M4A4 | Cyber Security (Field-Tested)",
            });
            auction.placeBid();
            const events = auction.pullDomainEvents();
            expect(auction.getNumberOfBids()).toBe(1);
            expect(auction.getHighestBid()).toBe(3656n);
            expect(auction.getNextBid()).toBe(3693n);

            expect(events).toHaveLength(2);
            expect(events[1]).toBeInstanceOf(BidPlacedDomainEvent);
            expect(events[1].toPrimitives()).toMatchObject({
                eventId: expect.any(String),
                aggregateId: auction.getId(),
                name: "bid_placed",
                ocurredAt: new Date(),
            });
        });
        it("Should place a bid and outbid than bid again", () => {
            const auction = Auction.start({
                externalId: 288767047,
                startedAt: now,
                endsAt,
                startingPrice: 3656,
                itemName: "M4A4 | Cyber Security (Field-Tested)",
            });
            auction.placeBid();
            expect(auction.getNumberOfBids()).toBe(1);
            expect(auction.getHighestBid()).toBe(3656n);
            expect(auction.getNextBid()).toBe(3693n);
            auction.placeBid();
            expect(auction.getNumberOfBids()).toBe(2);
            expect(auction.getHighestBid()).toBe(3693n);
            expect(auction.getNextBid()).toBe(3730n);
            auction.placeBid();
            expect(auction.getNumberOfBids()).toBe(3);
            expect(auction.getHighestBid()).toBe(3730n);
            expect(auction.getNextBid()).toBe(3767n);

            const events = auction.pullDomainEvents();
            expect(events).toHaveLength(4);
            expect(events[0]).toBeInstanceOf(AuctionStartedDomainEvent);
            expect(events[1]).toBeInstanceOf(BidPlacedDomainEvent);
            expect(events[2]).toBeInstanceOf(BidPlacedDomainEvent);
            expect(events[3]).toBeInstanceOf(BidPlacedDomainEvent);
        });
    });
});
