import { MaxForType, type MaxForPrimitives } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for";

export const maxForPercentage = (value: string): MaxForPrimitives => ({ type: MaxForType.PERCENTAGE, value });

export const maxForValue = (value: number): MaxForPrimitives => ({ type: MaxForType.VALUE, value });
