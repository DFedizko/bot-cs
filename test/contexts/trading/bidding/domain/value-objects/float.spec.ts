import { DomainError } from '@/shared/error/domain-error';

describe('Float', () => {
    it('Should create a float object', () => {
        const float = Float.create(0.157);
        expect(float.getValue()).toBe(0.157);
        expect(float.isApproximate()).toBe(true);
        expect(float.isExact()).toBe(false);
        expect(float.getWear()).toBe(WearNames.FIELD_TESTED);
        expect(float.getWearAcronym()).toBe(WearNameAcronyms.FT);
    });
    it('Should create a float object with exact value', () => {
        const float = Float.create(0.00000000010431);
        expect(float.getValue()).toBe(0.00000000010431);
        expect(float.isExact()).toBe(true);
        expect(float.isApproximate()).toBe(false);
        expect(float.getWear()).toBe(WearNames.FACTORY_NEW);
        expect(float.getWearAcronym()).toBe(WearNameAcronyms.FN);
    });
    it('Should return the correct wear name and acronym by your float', () => {
        const battleScarred = Float.create(0.451);
        const wellWorn = Float.create(0.383);
        const fieldTested = Float.create(0.152);
        const minimalWear = Float.create(0.077);
        const factoryNew = Float.create(0.001);
        expect(battleScarred.getWear()).toBe(WearNames.BATTLE_SCARRED);
        expect(battleScarred.getWearAcronym()).toBe(WearNameAcronyms.BS);
        expect(wellWorn.getWear()).toBe(WearNames.WELL_WORN);
        expect(wellWorn.getWearAcronym()).toBe(WearNameAcronyms.WW);
        expect(fieldTested.getWear()).toBe(WearNames.FIELD_TESTED);
        expect(fieldTested.getWearAcronym()).toBe(WearNameAcronyms.FT);
        expect(minimalWear.getWear()).toBe(WearNames.MINIMAL_WEAR);
        expect(minimalWear.getWearAcronym()).toBe(WearNameAcronyms.MW);
        expect(factoryNew.getWear()).toBe(WearNames.FACTORY_NEW);
        expect(factoryNew.getWearAcronym()).toBe(WearNameAcronyms.FN);
    });
    it('Should reject a float bigger than 1 and less than 0', () => {
        expect(() => Float.create(1)).toThrow(DomainError);
        expect(() => Float.create(-1)).toThrow(DomainError);
    });
    it('Should reject a float bigger or equal than 1 and less or equal than 0', () => {
        expect(() => Float.create(1)).toThrow(DomainError);
        expect(() => Float.create(-1)).toThrow(DomainError);
        expect(() => Float.create(0)).toThrow(DomainError);
    });
    it(`Should reject a float with more than ${Float.MAX_DECIMAL_CASES} decimal cases`, () => {
        expect(() => Float.create(0.000000000104311)).toThrow(DomainError);
    });
});
