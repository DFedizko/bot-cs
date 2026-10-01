import { COIN } from '@/shared-kernel/domain/coin'
import { Money } from '@/shared/domain-primitives/money'
import { Percentage } from '@/shared/domain-primitives/percentage'

describe('Gloves', () => {
  it('Should create gloves in an auction status', () => {
    const gloves = Gloves.create({
      name: Name.create('Sport Gloves | Bronze Morph (Field-Tested)'),
      price: Price.create({
        marketValue: Money.fromCents({ amount: 12903, currency: COIN }),
        suggestedValue: Money.fromCents({ amount: 13677, currency: COIN }),
        aboveRecommendedPercentage: Percentage.fromPercent('-6'),
      }),
      status: ItemStatus.auctioning(
        Auction.create({
          endsAt: AuctionEndTime.fromUnixTimestamp(1786734016),
          numberOfBids: 0,
        }),
      ),
      float: Float.create(0.363),
    })

    expect(gloves.getDomainEvents()).toHaveLength(1)
    expect(gloves.getName()).toBe('Sport Gloves | Bronze Morph (Field-Tested)')
    expect(gloves.getMarketPrice()).toBe(
      Money.fromCents({ amount: 12903, currency: COIN }),
    )
    expect(gloves.getSuggestedPrice()).toBe(
      Money.fromCents({ amount: 13677, currency: COIN }),
    )
    expect(gloves.getAboveRecommendedPercentage()).toBe('-6')
    expect(gloves.getFloat()).toBe(Float.create(0.363))
    expect(gloves.getWear()).toBe('Field-Tested')
    expect(gloves.getWearAcronym()).toBe('FT')
    expect(gloves.getRarity()).toBe(Rarity.RARE_SPECIAL_ITEM)
    expect(gloves.getStatus()).toBe('auctioning')
    expect(gloves.getAuctionEndsAt()).toEqual(new Date(1786734016 * 1000))
    expect(gloves.getAuctionHighestBid()).toBe(undefined)
    expect(gloves.getNumberOfBids()).toBe(0)

    expect(gloves.isCommodity()).toBe(false)
    expect(gloves.isExactFloat()).toBe(false)
    expect(gloves.isApproximateFloat()).toBe(true)
    expect(gloves.onAuction()).toBe(true)
  })
  // check expired auction
})
