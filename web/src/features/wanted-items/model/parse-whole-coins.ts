const WHOLE_NUMBER = /^\d+$/;
const MAX_WHOLE_COINS = 1_000_000;

export const parseWholeCoins = (text: string): number | null => {
    const trimmed = text.trim();
    const coins = Number(trimmed);
    return WHOLE_NUMBER.test(trimmed) && coins > 0 && coins <= MAX_WHOLE_COINS ? coins : null;
};
