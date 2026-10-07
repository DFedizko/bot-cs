import { AndSpecification, Specification } from "@/shared/building-blocks/specification";

type Person = { age: number; gender: "male" | "female" };
const adultMalePerson: Person = { age: 18, gender: "male" };
const adultFemalePerson: Person = { age: 18, gender: "female" };
const notAdultPerson: Person = { age: 17, gender: "male" };

class IsAdult extends Specification<Person> {
    isSatisfiedBy(candidate: Person): boolean {
        return candidate.age >= 18;
    }
}

class IsMale extends Specification<Person> {
    isSatisfiedBy(candidate: Person): boolean {
        return candidate.gender === "male";
    }
}

class IsFemale extends Specification<Person> {
    isSatisfiedBy(candidate: Person): boolean {
        return candidate.gender === "female";
    }
}

const isAdult = new IsAdult();
const isMale = new IsMale();
const isFemale = new IsFemale();
describe("Specification", () => {
    describe("IsSatisfiedBy", () => {
        it("Should return true when use a person with age less than 18 and adult specification", () =>
            expect(isAdult.isSatisfiedBy(adultMalePerson)).toBe(true));
        it("Should return false when use a person with age less than 18 and adult specification", () =>
            expect(isAdult.isSatisfiedBy(notAdultPerson)).toBe(false));
    });
    describe("And", () => {
        it("Should verify a adult man", () => {
            const isAdultMan = isAdult.and(isMale).isSatisfiedBy(adultMalePerson);
            expect(isAdultMan).toBe(true);
        });
        it("Should verify a adult woman", () => {
            const isAdultFemale = isAdult.and(isFemale).isSatisfiedBy(adultFemalePerson);
            expect(isAdultFemale).toBe(true);
        });
        it("Should return false when use a woman and male specification", () => {
            const isFemale = isAdult.and(isMale).isSatisfiedBy(adultFemalePerson);
            expect(isFemale).toBe(false);
        });
    });
    describe("Or", () => {
        it("Should return true when some of conditions is served", () => {
            const isAdultOrMale = isAdult.or(isMale).isSatisfiedBy(notAdultPerson);
            expect(isAdultOrMale).toBe(true);
        });
        it("Should return false when none of the conditions are met", () => {
            const isAdultOrFemale = isAdult.or(isFemale).isSatisfiedBy(notAdultPerson);
            expect(isAdultOrFemale).toBe(false);
        });
    });
    describe("Not", () => {
        it("Should return true when the condition is false", () => {
            const isNotFemale = isFemale.not().isSatisfiedBy(adultMalePerson);
            expect(isNotFemale).toBe(true);
        });
        it("Should return false when the condition is true", () => {
            const isNotFemale = isFemale.not().isSatisfiedBy(adultFemalePerson);
            expect(isNotFemale).toBe(false);
        });
    });
});
