import { DomainError } from '@/shared/error/domain-error'

describe('Name', () => {
  it('Should create a name object', () => {
    expect(Name.create('AWP | Asiimov (Field-Tested)').getValue()).toBe(
      'AWP | Asiimov (Field-Tested)',
    )
  })
  it('Should normalize a name with spaces at the beginning and the end', () => {
    expect(Name.create(' AWP | Asiimov (Field-Tested) ').getValue()).toBe(
      'AWP | Asiimov (Field-Tested)',
    )
  })
  it('Should throw an error when the name has more then 50 characters or less then 3 characters', () => {
    expect(() => Name.create('AA')).toThrow(DomainError)
    expect(() =>
      Name.create('AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXXYYZ'),
    ).toThrow(DomainError)
  })
  it('Should throw an error when an empty name was passed', () => {
    expect(() => Name.create(' ')).toThrow(DomainError)
  })
})
