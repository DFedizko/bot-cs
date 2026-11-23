import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";
import type { MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";

export type EditWantedItemInput = {
    accountId: number;
    name: string;
    maxFor?: MaxForPrimitives;
    criteria?: CriteriaPrimitives;
};
