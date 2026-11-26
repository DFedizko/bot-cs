type NamedParts = {
    weapon: string;
    skin: string | null;
    wear: string | null;
    stattrak: boolean;
    category: string;
};

const STATTRAK = "StatTrak™ ";
const STAR = "★ ";
const STARRED_CATEGORIES = new Set(["Knives", "Gloves"]);

export const toMockMarketName = ({ weapon, skin, wear, stattrak, category }: NamedParts) =>
    [
        STARRED_CATEGORIES.has(category) ? STAR : "",
        stattrak ? STATTRAK : "",
        weapon,
        skin ? ` | ${skin}` : "",
        wear ? ` (${wear})` : "",
    ].join("");
