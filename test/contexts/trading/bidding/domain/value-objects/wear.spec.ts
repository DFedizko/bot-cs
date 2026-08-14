import { Percentage } from '@/shared/domain-primitives/percentage'
import { DomainError } from '@/shared/error/domain-error'

describe('Wear', () => {
  it('Should create a wear object with float type', () => {
    const wear = Wear.create({
      type: 'float',
      float: Float.create(0.157),
    })
    expect(wear.getType()).toBe('float')
    expect(wear.getFloat()).toBe(0.157)
  })
  it('Should create a wear object with percentage type', () => {
    const wear = Wear.create({
      type: 'percentage',
      percentage: Percentage.fromPercent('10'),
    })
    expect(wear.getType()).toBe('float')
    expect(wear.getPercentage().toString()).toBe('10%')
  })
  it('Should return the correct wear name and acronym by your float', () => {
    const battleScarred = Wear.create({
      type: 'float',
      float: Float.create(0.451),
    })
    const wellWorn = Wear.create({
      type: 'float',
      float: Float.create(0.383),
    })
    const fieldTested = Wear.create({
      type: 'float',
      float: Float.create(0.152),
    })
    const minimalWear = Wear.create({
      type: 'float',
      float: Float.create(0.077),
    })
    const factoryNew = Wear.create({
      type: 'float',
      float: Float.create(0.001),
    })
    expect(battleScarred.getName()).toBe(WearNames.BATTLE_SCARRED)
    expect(battleScarred.getNameAcronym()).toBe(WearNameAcronyms.BS)
    expect(wellWorn.getName()).toBe(WearNames.WELL_WORN)
    expect(wellWorn.getNameAcronym()).toBe(WearNameAcronyms.WW)
    expect(fieldTested.getName()).toBe(WearNames.FIELD_TESTED)
    expect(fieldTested.getNameAcronym()).toBe(WearNameAcronyms.FT)
    expect(minimalWear.getName()).toBe(WearNames.MINIMAL_WEAR)
    expect(minimalWear.getNameAcronym()).toBe(WearNameAcronyms.MW)
    expect(factoryNew.getName()).toBe(WearNames.FACTORY_NEW)
    expect(factoryNew.getNameAcronym()).toBe(WearNameAcronyms.FN)
	})
	it('Should wear name respect the float limit'() => {
		expect(Wear.create())
  })
  it('Should throw an error when get invalid wear types', () => {
    expect(() =>
      Wear.create({
        type: 'percentage',
        percentage: Percentage.fromPercent('10'),
      }).getFloat(),
    ).toThrow(DomainError)
    expect(() =>
      Wear.create({
        type: 'float',
        percentage: Percentage.fromPercent('10'),
      }).getPercentage(),
    ).toThrow(DomainError)
  })
  it('Should throw an error when get wear name or wear acronym and type is percentage', () => {
    const percentageWear = Wear.create({
      type: 'percentage',
      percentage: Percentage.fromPercent('10'),
    })
    expect(() => percentageWear.getName()).toThrow(DomainError)
    expect(() => percentageWear.getNameAcronym()).toThrow(DomainError)
  })
})
