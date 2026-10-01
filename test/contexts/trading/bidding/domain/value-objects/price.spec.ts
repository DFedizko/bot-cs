import { COIN } from '@/shared-kernel/domain/coin'
import { Money } from '@/shared/domain-primitives/money'
import { Percentage } from '@/shared/domain-primitives/percentage'

describe('Price', () => {
  it('Should create a price object', () => {
    const price = Price.create({
      marketPrice: Money.fromCents({ amount: 100, currency: COIN }),
      suggestedPrice: Money.fromCents({ amount: 110, currency: COIN }),
      aboveRecommendedPercentage: Percentage.fromPercent('0'),
    })
    expect(
      price
        .getMarketPrice()
        .comparteTo(Money.fromCents({ amount: 100, currency: COIN })),
    ).toBe(0)
    expect(
      price
        .getSuggestedPrice()
        .comparteTo(Money.fromCents({ amount: 110, currency: COIN })),
    ).toBe(0)
    expect(
      price.getAboveRecommendedPercentage().equals(Percentage.fromPercent('0')),
    ).toBe(true)
  })
})
