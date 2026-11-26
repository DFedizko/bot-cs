const WHOLE_NUMBER = /^\d+$/;

export const parseWholeCoins = (text: string): number | null => {
    const trimmed = text.trim();
    const coins = Number(trimmed);
    return WHOLE_NUMBER.test(trimmed) && coins > 0 ? coins : null;
};
