import { COIN } from '@/shared-kernel/domain/coin'
import { Money } from '@/shared/domain-primitives/money'
import { Percentage } from '@/shared/domain-primitives/percentage'

describe('Item', () => {
  it('Should create an item in an auction status', () => {
    const sticker = Sticker.create({
      name: Name.create('Team Dignitas (Holo) | Cologne 2014'),
      wear: Wear.create({
        type: 'percentage',
        amount: Percentage.fromPercent('8'),
      }),
      type: StickerTypes.HOLO,
    })
    const item = Item.create({
      name: Name.create('AWP | Asiimov (Field-Tested)'),
      price: Price.create({
        marketValue: Money.fromCents({ amount: 130, currency: COIN }),
        suggestedValue: Money.fromCents({ amount: 140, currency: COIN }),
        aboveRecommendedPercentage: Percentage.fromPercent('7.69'),
      }),
      wear: Wear.create({
        type: 'float',
        float: Float.create(0.157),
      }),
      rarity: Rarity.COVERT,
      stickers: [sticker],
      status: ItemStatus.auctioning(
        Auction.create({
          endsAt: AuctionEndTime.fromUnixTimestamp(1786667127),
          highestBid: Money.fromCents({ amount: 131, currency: COIN }),
          numberOfBids: 1,
        }),
      ),
    })

    expect(item.getDomainEvents()).toHaveLength(1)
    expect(item.getName()).toBe('AWP | Asiimov (Field-Tested)')
    expect(item.getMarketValue()).toBe(130n)
    expect(item.getSuggestedValue()).toBe(140n)
    expect(item.getAboveRecommendedPercentage()).toBe('7.69')
    expect(item.getWear().getFloat()).toBe(0.157)
    expect(item.getWear().getName()).toBe('Field-Tested')
    expect(item.getRarity()).toBe(Rarity.COVERT)
    expect(item.getStickers()).toContain(sticker)
    expect(item.getStatus()).toBe('auctioning')
    expect(item.getAuctionEndsAt()).toEqual(new Date(1786667127 * 1000))
    expect(item.getAuctionHighestBid()).toBe(131n)
    expect(item.getNumberOfBids()).toBe(1)

    expect(item.isCommodity()).toBe(false)
    expect(item.floatIsComplete()).toBe(false)
    expect(item.hasStickers()).toBe(true)
    expect(item.onAuction()).toBe(true)
    expect(item.hasUnscratchedStickers()).toBe(true)
  })
  // check expired auction
})
