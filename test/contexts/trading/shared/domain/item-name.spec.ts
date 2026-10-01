import { ItemName } from "@/contexts/trading/shared/domain/item-name";
import { DomainError } from "@/shared/error/domain-error";

describe("ItemName", () => {
    it("Should create a name object", () => {
        expect(ItemName.create("AWP | Asiimov (Field-Tested)").getValue()).toBe("AWP | Asiimov (Field-Tested)");
    });
    it("Should normalize a name with spaces at the beginning and the end", () => {
        expect(ItemName.create(" AWP | Asiimov (Field-Tested) ").getValue()).toBe("AWP | Asiimov (Field-Tested)");
    });
    it(`Should throw an error when the name has more then ${ItemName.MAX_CHAR} characters or less then ${ItemName.MIN_CHAR} characters`, () => {
        expect(() => ItemName.create("AA")).toThrow(DomainError);
        expect(() => ItemName.create("AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXXYYZ")).toThrow(DomainError);
    });
    it("Should throw an error when an empty name was passed", () => {
        expect(() => ItemName.create(" ")).toThrow(DomainError);
    });
});
