import { parsePercentage } from "./parse-percentage";

const NEGATIVE_HINT = "Negative = below.";
const FIELD_HINT = "Percentage over the recommended price.";
const AT_RECOMMENDED = "Bot bids up to the recommended price.";

const describeBid = (percentage: number) => {
    if (percentage === 0) return AT_RECOMMENDED;
    const direction = percentage < 0 ? "below" : "above";
    return `Bot bids up to ${Math.abs(percentage)}% ${direction} the recommended price.`;
};

export function describePercentage(text: string): string {
    const percentage = parsePercentage(text);
    return `${percentage === null ? FIELD_HINT : describeBid(percentage)} ${NEGATIVE_HINT}`;
}
