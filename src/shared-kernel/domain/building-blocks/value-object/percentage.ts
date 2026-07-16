import { DomainError } from '@/shared-kernel/domain/error/domain-error'
import { ValueObject } from '@/shared-kernel/domain/building-blocks/value-object/value-object'

export type RoundingMode = 'HALF_EVEN' | 'HALF_AWAY_FROM_ZERO'

enum ERROR_CODE {
  INVALID_PERCENTAGE = 'INVALID_PERCENTAGE',
}

type PercentageProps = {
  scaledFraction: bigint
}

export class Percentage extends ValueObject<PercentageProps> {
  private static readonly DECIMAL_PATTERN_REGEX = /^-?\d+(\.\d+)?$/
  private static readonly FRACTION_DECIMALS = 8
  private static readonly PERCENT_DECIMALS = Percentage.FRACTION_DECIMALS - 2
  private static readonly PERCENT_PER_UNIT = 100n
  public static readonly SCALE = 10n ** BigInt(Percentage.FRACTION_DECIMALS)

  private constructor(protected readonly props: PercentageProps) {
    super(props)
  }

  static fromPercent(percent: string): Percentage {
    const scaledPercent = Percentage.parseDecimalToScaled(
      percent,
      Percentage.FRACTION_DECIMALS,
    )
    return new Percentage({
      scaledFraction: scaledPercent / Percentage.PERCENT_PER_UNIT,
    })
  }

  static fromFraction(fraction: string) {
    return new Percentage({
      scaledFraction: Percentage.parseDecimalToScaled(
        fraction,
        Percentage.FRACTION_DECIMALS,
      ),
    })
  }

  private static parseDecimalToScaled(value: string, decimals: number): bigint {
    const trimmed = value.trim()
    if (!this.DECIMAL_PATTERN_REGEX.test(trimmed)) {
      throw new DomainError({
        message: `Invalid percentage/fraction: "${value}"`,
        code: ERROR_CODE.INVALID_PERCENTAGE,
      })
    }

    const isNegative = trimmed.startsWith('-')
    const unsigned = isNegative ? trimmed.slice(1) : trimmed
    const [intPart, fracPart = ''] = unsigned.split('.')

    const normalizedFraction = fracPart.padEnd(decimals, '0').slice(0, decimals)
    const scaled = BigInt(intPart + normalizedFraction)
    return isNegative ? -scaled : scaled
  }
}
