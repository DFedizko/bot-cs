import { Float } from "@/contexts/trading/shared/domain/float";
import { WearName } from "@/shared-kernel/domain/wear-name";
import { WearNameAcronym } from "@/shared-kernel/domain/wear-name-acronym";
import { DomainError } from "@/shared/error/domain-error";

describe("Float", () => {
    it("Should create a float object", () => {
        const float = new Float(0.157);
        expect(float.getValue()).toBe(0.157);
        expect(float.isApproximate()).toBe(true);
        expect(float.isExact()).toBe(false);
        expect(float.getWear()).toBe(WearName.FIELD_TESTED);
        expect(float.getWearAcronym()).toBe(WearNameAcronym.FT);
    });
    it("Should create a float object with exact value", () => {
        const float = new Float(0.00000000010431);
        expect(float.getValue()).toBe(0.00000000010431);
        expect(float.isExact()).toBe(true);
        expect(float.isApproximate()).toBe(false);
        expect(float.getWear()).toBe(WearName.FACTORY_NEW);
        expect(float.getWearAcronym()).toBe(WearNameAcronym.FN);
    });
    it("Should return the correct wear name and acronym by your float", () => {
        const battleScarred = new Float(0.451);
        const wellWorn = new Float(0.383);
        const fieldTested = new Float(0.152);
        const minimalWear = new Float(0.077);
        const factoryNew = new Float(0.001);
        expect(battleScarred.getWear()).toBe(WearName.BATTLE_SCARRED);
        expect(battleScarred.getWearAcronym()).toBe(WearNameAcronym.BS);
        expect(wellWorn.getWear()).toBe(WearName.WELL_WORN);
        expect(wellWorn.getWearAcronym()).toBe(WearNameAcronym.WW);
        expect(fieldTested.getWear()).toBe(WearName.FIELD_TESTED);
        expect(fieldTested.getWearAcronym()).toBe(WearNameAcronym.FT);
        expect(minimalWear.getWear()).toBe(WearName.MINIMAL_WEAR);
        expect(minimalWear.getWearAcronym()).toBe(WearNameAcronym.MW);
        expect(factoryNew.getWear()).toBe(WearName.FACTORY_NEW);
        expect(factoryNew.getWearAcronym()).toBe(WearNameAcronym.FN);
    });
    it("Should reject a float bigger or equal than 1 and less or equal than 0", () => {
        expect(() => new Float(1)).toThrow(DomainError);
        expect(() => new Float(-1)).toThrow(DomainError);
        expect(() => new Float(0)).toThrow(DomainError);
    });
    it(`Should reject a float with more than ${Float.MAX_DECIMAL_CASES} decimal cases`, () => {
        expect(() => new Float(0.000000000104311234563)).toThrow(DomainError);
    });
});
