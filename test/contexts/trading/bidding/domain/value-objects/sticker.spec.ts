import { DomainError } from '@/shared/error/domain-error'

describe('Sticker', () => {
  it('Should create a sticker object', () => {
    const sticker = Sticker.create({
      name: Name.create('Team Dignitas (Holo) | Cologne 2014'),
      percentageWear: PercentageWear.create(Percentage.fromPercent('8')),
      type: StickerTypes.HOLO,
      position: 5,
    })
    expect(sticker.getName()).toBe('Team Dignitas (Holo) | Cologne 2014')
    expect(sticker.getWear()).toBe(Percentage.fromPercent('8'))
    expect(sticker.getType()).toBe(StickerTypes.HOLO)
    expect(sticker.getPosition()).toBe(5)
  })
  it('Should throw an error when sticker position is decimal', () => {
    expect(() =>
      Sticker.create({
        name: Name.create('Team Dignitas (Holo) | Cologne 2014'),
        percentageWear: PercentageWear.create(Percentage.fromPercent('8')),
        type: StickerTypes.HOLO,
        position: 0.1,
      }),
    ).toThrow(DomainError)
  })
  it('Should throw an error when sticker position is less than 1 or bigger than 5', () => {
    expect(() =>
      Sticker.create({
        name: Name.create('Team Dignitas (Holo) | Cologne 2014'),
        percentageWear: PercentageWear.create(Percentage.fromPercent('8')),
        type: StickerTypes.HOLO,
        position: 0,
      }),
    ).toThrow(DomainError)
    expect(() =>
      Sticker.create({
        name: Name.create('Team Dignitas (Holo) | Cologne 2014'),
        percentageWear: PercentageWear.create(Percentage.fromPercent('8')),
        type: StickerTypes.HOLO,
        position: 6,
      }),
    ).toThrow(DomainError)
  })
})
