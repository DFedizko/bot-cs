const KNIFE_MARK = "★";

export const toWeaponLabel = (marketName: string, weapon: string) =>
    marketName.startsWith(KNIFE_MARK) ? `${KNIFE_MARK} ${weapon}` : weapon;
