import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import type { CatalogItemBody } from "../controllers/catalog-items.http-body";

export const SEARCH_TEXT_EXAMPLE = "awp asii";
export const SEARCH_LIMIT_EXAMPLE = 5;

export const CATALOG_ITEM_EXAMPLE: CatalogItemBody = {
    marketHashName: "AWP | Asiimov (Field-Tested)",
    weapon: "AWP",
    skin: "Asiimov",
    wear: WearName.FIELD_TESTED,
    stattrak: false,
    souvenir: false,
    category: "Rifles",
    rarity: "covert",
    imageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ",
};

export const VANILLA_ITEM_EXAMPLE: CatalogItemBody = {
    marketHashName: "★ Karambit",
    weapon: "Karambit",
    skin: null,
    wear: null,
    stattrak: false,
    souvenir: false,
    category: "Knives",
    rarity: "covert",
    imageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XuWbwcuyMESA4Fdl-4nnpU7iQA3-kKnr8ytd6s2labZsLfKaGinEx-0u5LhqGHrjlElz52jRmN2sd3yfb1NzWZVwRbNeu0S5k9WxMuvh-UWA3ObnwJvj",
};
