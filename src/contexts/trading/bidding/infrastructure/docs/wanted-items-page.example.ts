import { FIRST_PAGE } from "@/packages/building-blocks/pagination";
import type {
    ListWantedItemsResponse,
    WantedItemDto,
} from "../../application/list-wanted-items/list-wanted-items.response";
import type { CatalogDetailsDto } from "../../application/list-wanted-items/catalog-details.gateway";
import { MaxForType } from "../../domain/wanted-item/max-for/max-for";
import { WANTED_ITEM_EXAMPLE } from "./wanted-item.example";

const STEAM_IMAGES = "https://community.akamai.steamstatic.com/economy/image/";
const FIELD_TESTED = "Field-Tested";
const FACTORY_NEW = "Factory New";
const EXAMPLE_PAGE_SIZE = 4;

export const ASIIMOV_CATALOG = {
    imageUrl: `${STEAM_IMAGES}i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ`,
    rarity: "covert",
    weapon: "AWP",
    skin: "Asiimov",
    wear: FIELD_TESTED,
    stattrak: false,
    souvenir: false,
} as const satisfies CatalogDetailsDto;

const REDLINE_CATALOG: CatalogDetailsDto = {
    imageUrl: `${STEAM_IMAGES}i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzOtyufRkASq2lkxx4W-HnNyqJC3FZwYoC5p0Q7FfthW6wdWxPu-371Pdit5HnyXgznQeHYY5wyA`,
    rarity: "classified",
    weapon: "AK-47",
    skin: "Redline",
    wear: FIELD_TESTED,
    stattrak: true,
    souvenir: false,
};

const KARAMBIT_CATALOG: CatalogDetailsDto = {
    imageUrl: `${STEAM_IMAGES}i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i4QKJk4jxNWWXawUgA8dxRLEO40KwkobnMbnj5QKL348Qmy-sji5K7i466uxUUKQn5OSJ2KBZjkQR`,
    rarity: "extraordinary",
    weapon: "Karambit",
    skin: "Doppler",
    wear: FACTORY_NEW,
    stattrak: false,
    souvenir: false,
};

export const ASIIMOV_WANTED = {
    name: WANTED_ITEM_EXAMPLE.name,
    maxFor: { type: MaxForType.PERCENTAGE, value: WANTED_ITEM_EXAMPLE.maxPercentage },
    criteria: [{ type: WANTED_ITEM_EXAMPLE.criterionType, value: WANTED_ITEM_EXAMPLE.wear }],
    enabled: true,
    addedAt: "2026-11-20T14:03:00.000Z",
    catalog: ASIIMOV_CATALOG,
} satisfies WantedItemDto;

const REDLINE_WANTED: WantedItemDto = {
    name: "StatTrak™ AK-47 | Redline (Field-Tested)",
    maxFor: { type: MaxForType.VALUE, value: 4250 },
    criteria: [],
    enabled: true,
    addedAt: "2026-11-19T09:41:00.000Z",
    catalog: REDLINE_CATALOG,
};

const KARAMBIT_WANTED: WantedItemDto = {
    name: "★ Karambit | Doppler (Factory New)",
    maxFor: { type: MaxForType.PERCENTAGE, value: "2" },
    criteria: [],
    enabled: false,
    addedAt: "2026-11-18T21:15:00.000Z",
    catalog: KARAMBIT_CATALOG,
};

const UNKNOWN_WANTED: WantedItemDto = {
    name: "Sticker | Titan (Holo) | Katowice 2014",
    maxFor: { type: MaxForType.VALUE, value: 9_500_000 },
    criteria: [],
    enabled: true,
    addedAt: "2026-11-17T08:30:00.000Z",
    catalog: null,
};

export const WANTED_ITEMS_PAGE: ListWantedItemsResponse = {
    items: [ASIIMOV_WANTED, REDLINE_WANTED, KARAMBIT_WANTED, UNKNOWN_WANTED],
    page: FIRST_PAGE,
    pageSize: EXAMPLE_PAGE_SIZE,
    total: 47,
    counts: { all: 47, enabled: 41, disabled: 6 },
};
