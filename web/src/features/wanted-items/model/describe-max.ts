import { formatCoins } from "@/shared/lib/format-coins";
import type { MaxFor } from "./max-for";
import type { MaxTone } from "./max-tone";

export type MaxDescription = { tone: MaxTone; value: string; relative: boolean };

const MINUS = "−";
const PLUS = "+";
const PERCENT = "%";

const toneOf = (percentage: number): MaxTone => {
    if (percentage < 0) return "below";
    return percentage > 0 ? "above" : "even";
};

const signOf = (percentage: number) => {
    if (percentage < 0) return MINUS;
    return percentage > 0 ? PLUS : "";
};

export function describeMax(maxFor: MaxFor): MaxDescription {
    if (maxFor.type === "value") return { tone: "even", value: formatCoins(maxFor.value), relative: false };
    const percentage = maxFor.value;
    return {
        tone: toneOf(percentage),
        value: `${signOf(percentage)}${Math.abs(percentage)}${PERCENT}`,
        relative: true,
    };
}
