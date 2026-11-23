import { UnknownMaxForError } from "../errors/unknown-max-for.error";
import { MaxForType, type MaxFor, type MaxForPrimitives } from "./max-for";
import { MaxForPercentage } from "./max-for-percentage";
import { MaxForValue } from "./max-for-value";

type MaxForBuilders = { [K in MaxForType]: (value: MaxForPrimitives<K>["value"]) => MaxFor };

const maxForBuilders: MaxForBuilders = {
    [MaxForType.PERCENTAGE]: (percent) => new MaxForPercentage(percent),
    [MaxForType.VALUE]: (cents) => new MaxForValue(cents),
};

export class MaxForFactory {
    static create<K extends MaxForType>(primitives: MaxForPrimitives<K>): MaxFor {
        if (!MaxForFactory.isKnownType(primitives.type)) throw new UnknownMaxForError(primitives.type);
        return MaxForFactory.build(primitives);
    }

    private static build<K extends MaxForType>({ type, value }: MaxForPrimitives<K>): MaxFor {
        const builder: MaxForBuilders[K] = maxForBuilders[type];
        return builder(value);
    }

    private static isKnownType(type: string): type is MaxForType {
        return Object.hasOwn(maxForBuilders, type);
    }
}
