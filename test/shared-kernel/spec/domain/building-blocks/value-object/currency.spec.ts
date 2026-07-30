import { Currency } from '@/shared-kernel/domain/building-blocks/value-object/currency'
import { DomainError } from '@/shared-kernel/domain/error/domain-error'

describe('Currency', () => {
  it('Should create a currency object', () => {
    const USD = Currency.create({
      code: 'USD',
      decimals: 2,
      locale: 'en-US',
    })

    expect(USD.getCode()).toBe('USD')
    expect(USD.getDecimals()).toBe(2)
    expect(USD.getLocale()).toBe('en-US')
  })
  it('Should always trim code and convert to upper case', () => {
    expect(Currency.create({ code: 'usd ', decimals: 2 }).getCode()).toBe('USD')
  })
  it('Should format original and custom currency', () => {
    expect(
      Currency.create({ code: 'USD', decimals: 2, locale: 'en-US' }).format(10),
    ).toBe('$10.00')
    expect(Currency.create({ code: 'RANDOM', decimals: 2 }).format(10)).toBe(
      '10.00 RANDOM',
    )
  })
  it('Should throw an error when the code is a empty string', () => {
    expect(() => Currency.create({ code: '', decimals: 2 })).toThrow(
      DomainError,
    )
  })
  it('Should throw an error when the code is a number in string format', () => {
    expect(() => Currency.create({ code: '123', decimals: 2 })).toThrow(
      DomainError,
    )
  })
  it('Should throw an error when the code is bigger then 10', () => {
    expect(() => Currency.create({ code: 'AAAAAAAAAAA', decimals: 2 })).toThrow(
      DomainError,
    )
  })
  it('Should throw an error when decimals is greater then 10', () => {
    expect(() => Currency.create({ code: 'BRL', decimals: 11 })).toThrow(
      DomainError,
    )
  })
  it('Should throw an error when the number of decimal places is a decimal', () => {
    expect(() => Currency.create({ code: 'BRL', decimals: 2.5 })).toThrow(
      DomainError,
    )
  })
})
