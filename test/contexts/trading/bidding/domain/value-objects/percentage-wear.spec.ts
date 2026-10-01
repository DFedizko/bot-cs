import { Percentage } from '@/shared/domain-primitives/percentage';
import { DomainError } from '@/shared/error/domain-error';

describe('PercentageWear', () => {
    it('Should create a percentage wear object from percentage string', () => {
        const percentageWear = PercentageWear.create(Percentage.fromPercent('10'));
        expect(percentageWear.getPercentage()).toBe('10');
        expect(percentageWear.getPercentageString()).toBe('10%');
        expect(percentageWear.getFraction()).toBe('0.1');
    });
    it('Should create a percentage wear object from fraction percentage', () => {
        const percentageWear = PercentageWear.create(Percentage.fromFraction('0.1'));
        expect(percentageWear.getPercentage()).toBe('10');
        expect(percentageWear.getPercentageString()).toBe('10%');
        expect(percentageWear.getFraction()).toBe('0.1');
    });
    it('Should throw an error when create a percentage wear object with negative percentage', () => {
        expect(() => PercentageWear.create(Percentage.fromPercent('-10'))).toThrow(DomainError);
    });
    it('Should throw an error when create a percentage wear object with a value above 100%', () => {
        expect(() => PercentageWear.create(Percentage.fromFraction('1.000000001'))).toThrow(DomainError);
        expect(() => PercentageWear.create(Percentage.fromPercent('100.0001'))).toThrow(DomainError);
    });
});
