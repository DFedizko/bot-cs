import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";

export type AddWantedItemInput = {
    accountId: number;
    name: string;
    maxFor: string;
    criteria?: CriteriaPrimitives;
};
