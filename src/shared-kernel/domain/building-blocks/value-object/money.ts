import { DomainError } from '@/shared-kernel/domain/error/domain-error'
import { ValueObject } from '@/shared-kernel/domain/building-blocks/value-object/value-object'

export const CURRENCY_REGISTRY = {
  USD: { decimals: 2, locale: 'en-US' },
  COIN: { decimals: 2, locale: 'en-US' }, // mudar os decimais e locale no futuro
} as const

export type Currency = keyof typeof CURRENCY_REGISTRY

enum ERROR_CODE {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_CURRENCY = 'INVALID_CURRENCY',
}

type MoneyProps = {
  amount: bigint
  currency: Currency
}

export class Money extends ValueObject<MoneyProps> {
  private static readonly DECIMAL_REGEX: RegExp = /^-?\d+(\.\d+)?$/

  private constructor(protected readonly props: MoneyProps) {
    super(props)
  }

  static fromCents({
    amount = 0,
    currency,
  }: {
    amount: number | bigint
    currency: Currency
  }): Money {
    Money.assertCurrency(currency)
    if (typeof amount === 'number' && !Number.isInteger(amount)) {
      throw new DomainError({
        message: `The amount of "${amount}" is not a integer`,
        code: ERROR_CODE.INVALID_AMOUNT,
      })
    }
    return new Money({ amount: BigInt(amount), currency })
  }

  static fromDecimal({
    amount,
    currency,
  }: {
    amount: string
    currency: Currency
  }): Money {
    Money.assertCurrency(currency)
    const { decimals } = CURRENCY_REGISTRY[currency]
    const trimmed = amount.trim()
    if (!Money.DECIMAL_REGEX.test(trimmed)) {
      throw new DomainError({
        message: `Invalid decimal value "${amount}"`,
        code: ERROR_CODE.INVALID_AMOUNT,
      })
    }

    const isNegative = trimmed.startsWith('-')
    const unsigned = isNegative ? trimmed.slice(1) : trimmed

    const [intPart, fracPart = ''] = unsigned.split('.')
    const fracAdjusted = fracPart.padEnd(decimals, '0').slice(0, decimals)

    const minor = BigInt(intPart + fracAdjusted)

    return new Money({ amount: isNegative ? -minor : minor, currency })
  }

  toCents(): bigint {
    return this.props.amount
  }

  toDecimalString(): string {
    const { decimals } = CURRENCY_REGISTRY[this.props.currency]
    const abs = this.isNegative() ? -this.props.amount : this.props.amount

    const digits = abs.toString().padStart(decimals + 1, '0')
    const intPart = digits.slice(0, digits.length - decimals)
    const fracPart = digits.slice(digits.length - decimals)
    return `${this.isNegative() ? '-' : ''}${intPart}.${fracPart}`
  }

  add(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money({
      amount: this.props.amount + other.getAmount(),
      currency: this.props.currency,
    })
  }

  substract(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money({
      amount: this.props.amount - other.props.amount,
      currency: this.props.currency,
    })
  }

  applyPercentage(percentage: number): Money {
    const amountInDecimal = Number(this.toDecimalString())
    const resultInDecimalString = (amountInDecimal * percentage).toString()
    return Money.fromDecimal({
      amount: resultInDecimalString,
      currency: this.getCurrency(),
    })
  }

  format(): string {
    const { locale } = CURRENCY_REGISTRY[this.getCurrency()]
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.getCurrency(),
    }).format(Number(this.toDecimalString()))
  }

  isNegative(): boolean {
    return this.props.amount < 0n
  }

  isPositive(): boolean {
    return this.props.amount > 0n
  }

  isZero(): boolean {
    return this.props.amount === 0n
  }

  getCurrency(): Currency {
    return this.props.currency
  }

  getAmount(): bigint {
    return this.props.amount
  }

  private static assertCurrency(currency: Currency): void {
    if (!(currency in CURRENCY_REGISTRY)) {
      throw new DomainError({
        message: `Currency not supported: "${currency}"`,
        code: ERROR_CODE.INVALID_CURRENCY,
      })
    }
  }

  private assertSameCurrency(other: Money) {
    if (this.props.currency !== other.getCurrency()) {
      throw new DomainError({
        message: `Currency "${other.getCurrency()}" must be the same as "${this.props.currency}"`,
        code: ERROR_CODE.INVALID_CURRENCY,
      })
    }
  }
}
