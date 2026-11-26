const PERCENTAGE = /^[-−+]?\d+(\.\d+)?$/;
const UNICODE_MINUS = "−";
const ASCII_MINUS = "-";

export const parsePercentage = (text: string): number | null => {
    const trimmed = text.trim();
    return PERCENTAGE.test(trimmed) ? Number(trimmed.replace(UNICODE_MINUS, ASCII_MINUS)) : null;
};
