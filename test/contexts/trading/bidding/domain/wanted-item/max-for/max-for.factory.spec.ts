import { MaxForFactory } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for.factory";
import { MaxForType, type MaxForPrimitives } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for";
import { MaxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for-percentage";
import { MaxForValue } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for-value";
import { UnknownMaxForError } from "@/contexts/trading/bidding/domain/wanted-item/errors/unknown-max-for.error";

const UNKNOWN_MAX_FOR = { type: "discount", value: "-3" } as unknown as MaxForPrimitives;

describe("MaxForFactory", () => {
    it("Should build a max for as a percentage", () => {
        const maxFor = MaxForFactory.create({ type: MaxForType.PERCENTAGE, value: "-3" });

        expect(maxFor).toEqual(new MaxForPercentage("-3"));
    });

    it("Should build a max for as a value", () => {
        const maxFor = MaxForFactory.create({ type: MaxForType.VALUE, value: 19400 });

        expect(maxFor).toEqual(new MaxForValue(19400));
    });

    it("Should reject a max for of an unknown type", () => {
        const create = () => MaxForFactory.create(UNKNOWN_MAX_FOR);

        expect(create).toThrow(UnknownMaxForError);
    });
});
