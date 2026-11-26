import type { MaxForPrimitives, MaxForType } from "../../domain/wanted-item/max-for/max-for";
import type { UserCurrency } from "./user-currency";

export type MaxValueInput = MaxForPrimitives<MaxForType.VALUE> & {
    currency?: UserCurrency;
};

export type MaxForInput = MaxForPrimitives<MaxForType.PERCENTAGE> | MaxValueInput;
