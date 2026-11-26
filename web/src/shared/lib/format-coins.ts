const CENTS_PER_COIN = 100;
const COIN_FORMAT = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatCoins = (cents: number) => COIN_FORMAT.format(cents / CENTS_PER_COIN);
