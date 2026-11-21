import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";

export type EditWantedItemInput = {
    accountId: number;
    name: string;
    maxFor?: string;
    criteria?: CriteriaPrimitives;
};
