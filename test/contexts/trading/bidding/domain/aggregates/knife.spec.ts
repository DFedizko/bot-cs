import { COIN } from '@/shared-kernel/domain/coin';
import { Money } from '@/shared/domain-primitives/money';
import { Percentage } from '@/shared/domain-primitives/percentage';

describe('Knife', () => {
    it('Should create a knife in an auction status', () => {
        const knife = Knife.create({
            name: Name.create('Gut Knife | Crimson Web (Battle-Scarred)'),
            price: Price.create({
                marketValue: Money.fromCents({ amount: 12051, currency: COIN }),
                suggestedValue: Money.fromCents({ amount: 12774, currency: COIN }),
                aboveRecommendedPercentage: Percentage.fromPercent('-6'),
            }),
            status: ItemStatus.auctioning(
                Auction.create({
                    endsAt: AuctionEndTime.fromUnixTimestamp(1786733841),
                    numberOfBids: 0,
                }),
            ),
            float: Float.create(0.524),
        });

        expect(knife.getDomainEvents()).toHaveLength(1);
        expect(knife.getName()).toBe('Gut Knife | Crimson Web (Battle-Scarred)');
        expect(knife.getMarketPrice()).toBe(Money.fromCents({ amount: 12051, currency: COIN }));
        expect(knife.getSuggestedPrice()).toBe(Money.fromCents({ amount: 12774, currency: COIN }));
        expect(knife.getAboveRecommendedPercentage()).toBe('-6');
        expect(knife.getFloat()).toBe(Float.create(0.524));
        expect(knife.getWear()).toBe('Battle-Scarred');
        expect(knife.getWearAcronym()).toBe('BS');
        expect(knife.getRarity()).toBe(Rarity.COVERT);
        expect(knife.getStatus()).toBe('auctioning');
        expect(knife.getAuctionEndsAt()).toEqual(new Date(1786733841 * 1000));
        expect(knife.getAuctionHighestBid()).toBe(undefined);
        expect(knife.getNumberOfBids()).toBe(0);

        expect(knife.isCommodity()).toBe(false);
        expect(knife.isExactFloat()).toBe(false);
        expect(knife.isApproximateFloat()).toBe(true);
        expect(knife.onAuction()).toBe(true);
        expect(knife.isStatTrak()).toBe(false);
    });
    // check expired auction
});
