import { COIN } from "@/shared-kernel/domain/coin";
import { Money } from "@/shared/domain-primitives/money";
import { stickers } from "@/contexts/trading/shared/__mocks__/stickers";
import { DomainError } from "@/shared/error/domain-error";
import { Price } from "@/contexts/trading/shared/domain/price";
import { Rarity } from "@/shared-kernel/domain/rarity";

describe("Skin", () => {
    it("Should create a skin in an auction status", () => {
        const skin = Skin.create({
            name: "AWP | Asiimov (Field-Tested)",
            price: Price.create({
                marketPriceInCents: 130,
                suggestedPriceInCents: 140,
                aboveRecommendedFractionPercentage: "0.0769",
            }),
            // status: ItemStatus.auctioning(
            //     Auction.create({
            //         endsAt: AuctionEndTime.fromUnixTimestamp(1786667127),
            //         highestBid: Money.fromCents({ amount: 131, currency: COIN }),
            //         numberOfBids: 1,
            //     }),
            // ),
            float: 0.157,
            rarity: Rarity.COVERT,
            stickers: [stickers.teamDignitasHoloCologne2014],
        });

        expect(skin.pullDomainEvents()).toHaveLength(1);
        expect(skin.getName()).toBe("AWP | Asiimov (Field-Tested)");
        expect(skin.getMarketPrice()).toBe(130);
        expect(skin.getSuggestedPrice()).toBe(140);
        expect(skin.getAboveRecommendedPercentage()).toBe("0.0769");
        expect(skin.getFloat()).toBe(0.157);
        expect(skin.getWear()).toBe("Field-Tested");
        expect(skin.getWearAcronym()).toBe("FT");
        expect(skin.getRarity()).toBe(Rarity.COVERT);
        expect(skin.getStickers()).toContain(stickers.teamDignitasHoloCologne2014);
        // expect(skin.getStatus()).toBe("auctioning");
        // expect(skin.getAuctionEndsAt()).toEqual(new Date(1786667127 * 1000));
        // expect(skin.getAuctionHighestBid()).toBe(Money.fromCents({ amount: 131, currency: COIN }));
        // expect(skin.getNumberOfBids()).toBe(1);

        expect(skin.isCommodity()).toBe(false);
        expect(skin.isExactFloat()).toBe(false);
        expect(skin.isApproximateFloat()).toBe(true);
        expect(skin.hasStickers()).toBe(true);
        // expect(skin.onAuction()).toBe(true);
        expect(skin.hasUnscratchedStickers()).toBe(false);
        expect(skin.isStatTrak()).toBe(false);
        expect(skin.isSouvenir()).toBe(false);
    });
    // check expired auction
    // it("Should throw an error when the skin haves more than one sticker in the same position", () => {
    //     expect(
    //         Skin.create({
    //             name: Name.create("AWP | Asiimov (Field-Tested)"),
    //             price: Price.create({
    //                 marketPriceInCents: 130,
    //                 suggestedPriceInCents: 140,
    //                 aboveRecommendedFractionPercentage: "0.0769",
    //             }),
    //             status: ItemStatus.auctioning(
    //                 Auction.create({
    //                     endsAt: AuctionEndTime.fromUnixTimestamp(1786667127),
    //                     highestBid: Money.fromCents({ amount: 131, currency: COIN }),
    //                     numberOfBids: 1,
    //                 }),
    //             ),
    //             float: 0.157,
    //             rarity: Rarity.COVERT,
    //             stickers: [stickers.teamDignitasHoloCologne2014, stickers.teamDignitasHoloCologne2014],
    //         }),
    //     ).toThrow(DomainError);
    // });
});
