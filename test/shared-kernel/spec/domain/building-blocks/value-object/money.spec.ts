import { Money } from '@/shared-kernel/domain/building-blocks/value-object/money'
import { DomainError } from '@/shared-kernel/domain/error/domain-error'

describe('Money', () => {
  describe('Create', () => {
    it('Should create a Money object from cents', () => {
      const money = Money.fromCents({ amount: 150n, currency: 'USD' })

      expect(money.getCurrency()).toBe('USD')
      expect(money.getAmount()).toBe(150n)
    })
    it('Should create a Money object from decimal', () => {
      const money = Money.fromDecimal({
        amount: '1.55',
        currency: 'USD',
      })

      expect(money.getCurrency()).toBe('USD')
      expect(money.getAmount()).toBe(155n)
    })
    it('Should create a Money object from negative cents', () => {
      const money = Money.fromCents({ amount: -150n, currency: 'USD' })

      expect(money.getCurrency()).toBe('USD')
      expect(money.getAmount()).toBe(-150n)
    })
    it('Should create a Money object from negative decimal', () => {
      const money = Money.fromDecimal({
        amount: '-1.55',
        currency: 'USD',
      })

      expect(money.getCurrency()).toBe('USD')
      expect(money.getAmount()).toBe(-155n)
    })
    it('Should throw an error when create a Money object with a invalid currency', () => {
      expect(() =>
        // @ts-expect-error for test
        Money.fromCents({ amount: 100, currency: 'USD1' }),
      ).toThrow(DomainError)
      expect(() =>
        // @ts-expect-error for test
        Money.fromDecimal({ amount: '1.00', currency: 'USD2' }),
      ).toThrow(DomainError)
    })
  })
  describe('Operations', () => {
    it('Must add up to a certain amount', () => {
      const money = Money.fromDecimal({ amount: '100.00', currency: 'USD' })
      const moneyToSum = Money.fromCents({ amount: 10000, currency: 'USD' })
      const negativeMoney = Money.fromCents({
        amount: -2000,
        currency: 'USD',
      })
      const negativeMoneyToSum = Money.fromCents({
        amount: -2000,
        currency: 'USD',
      })

      const moneyCombined = money.add(moneyToSum).getAmount()
      const negativeMoneyCombined = negativeMoney
        .add(negativeMoneyToSum)
        .getAmount()

      expect(moneyCombined).toBe(20000n)
      expect(negativeMoneyCombined).toBe(-4000n)
    })
    it('Must subtract a specific amount', () => {
      const money = Money.fromCents({ amount: 2000, currency: 'USD' })
      const moneyToSubstract = Money.fromDecimal({
        amount: '20',
        currency: 'USD',
      })
      const negativeMoney = Money.fromDecimal({
        amount: '-20.53',
        currency: 'USD',
      })
      const negativeMoneyToSubstract = Money.fromCents({
        amount: -2053,
        currency: 'USD',
      })

      const stolenMoney = money.substract(moneyToSubstract).getAmount()
      const negativeMoneyCombined = negativeMoney
        .substract(negativeMoneyToSubstract)
        .getAmount()

      expect(stolenMoney).toBe(0n)
      expect(negativeMoneyCombined).toBe(0n)
    })
    it('Should apply percentage', () => {
      const money = Money.fromCents({ amount: 100, currency: 'USD' })
      const moneyFromDecimal = Money.fromDecimal({
        amount: '0.850',
        currency: 'USD',
      })
      const percentageAppliedFromCents = money.applyPercentage(0.5)
      const percentageAppliedFromDecimal = moneyFromDecimal.applyPercentage(0.5)
      expect(percentageAppliedFromCents.getAmount()).toBe(50n)
      expect(percentageAppliedFromDecimal.getAmount()).toBe(42n)
    })
    it('Should throw an error when two different currencies are used', async () => {
      const money = Money.fromDecimal({ amount: '25.00', currency: 'USD' })
      const moneyToOperate = Money.fromDecimal({
        amount: '25.00',
        currency: 'COIN',
      })

      expect(() => money.add(moneyToOperate)).toThrow(DomainError)
    })
  })
  describe('Verifications', () => {
    it('Should verify a negative number', () => {
      const money = Money.fromDecimal({ amount: '-1.50', currency: 'USD' })
      expect(money.isNegative()).toBe(true)
      expect(money.isPositive()).toBe(false)
    })
    it('Should verify a positive number', () => {
      const money = Money.fromDecimal({ amount: '1.50', currency: 'USD' })
      expect(money.isPositive()).toBe(true)
      expect(money.isNegative()).toBe(false)
    })
    it('Should verify is zero', () => {
      const money = Money.fromDecimal({ amount: '0', currency: 'USD' })
      expect(money.isZero()).toBe(true)
    })
  })
  describe('Comparisons', () => {
    it('Should comparte equality', () => {
      const moneyA = Money.fromCents({ amount: 100, currency: 'USD' })
      const moneyB = Money.fromDecimal({ amount: '1.00', currency: 'USD' })
      expect(moneyA.equals(moneyB)).toBe(true)
    })
  })
  describe('Conversions', () => {
    it('Should convert decimal to cents', () => {
      const money = Money.fromDecimal({ amount: '1.00', currency: 'USD' })
      const negativeMoney = Money.fromDecimal({
        amount: '-1.00',
        currency: 'USD',
      })
      expect(money.toCents()).toBe(100n)
      expect(negativeMoney.toCents()).toBe(-100n)
    })
    it('Should convert cents to decimal', () => {
      const money = Money.fromCents({ amount: 100, currency: 'USD' })
      const negativeMoney = Money.fromCents({ amount: -100, currency: 'USD' })
      expect(money.toDecimalString()).toBe('1.00')
      expect(negativeMoney.toDecimalString()).toBe('-1.00')
    })
  })
  describe('Formatters', () => {
    const moneyFromDecimalToFormat = Money.fromDecimal({
      amount: '1.00',
      currency: 'USD',
    })
    const moneyFromCentsToFormat = Money.fromDecimal({
      amount: '1.00',
      currency: 'USD',
    })
    expect(moneyFromDecimalToFormat.format()).toBe('$1.00')
    expect(moneyFromCentsToFormat.format()).toBe('$1.00')
  })
})
