import type { Criterion } from "./criterion";
import type { MaxFor } from "./max-for";

export type NewWantedItem = {
    name: string;
    maxFor: MaxFor;
    criteria: Array<Criterion>;
    enabled: boolean;
};
