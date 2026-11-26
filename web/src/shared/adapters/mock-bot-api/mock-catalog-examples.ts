import type { MockWantedItem } from "./mock-wanted-item";

type MockCatalog = NonNullable<MockWantedItem["catalog"]>;

const STEAM_IMAGES = "https://community.akamai.steamstatic.com/economy/image/";

export const MOCK_CATALOG_EXAMPLES: ReadonlyArray<MockCatalog> = [
    {
        imageUrl: `${STEAM_IMAGES}i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ`,
        rarity: "Covert",
        weapon: "AWP",
        skin: "Asiimov",
        wear: "Field-Tested",
        stattrak: false,
        souvenir: false,
    },
    {
        imageUrl: `${STEAM_IMAGES}i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-RHGavzOtyufRkASq2lkxx4W-HnNyqJC3FZwYoC5p0Q7FfthW6wdWxPu-371Pdit5HnyXgznQeHYY5wyA`,
        rarity: "Classified",
        weapon: "AK-47",
        skin: "Redline",
        wear: "Field-Tested",
        stattrak: true,
        souvenir: false,
    },
    {
        imageUrl: `${STEAM_IMAGES}i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iUzv5mvOR7cDm7lA4i4QKJk4jxNWWXawUgA8dxRLEO40KwkobnMbnj5QKL348Qmy-sji5K7i466uxUUKQn5OSJ2KBZjkQR`,
        rarity: "Extraordinary",
        weapon: "Karambit",
        skin: "Doppler",
        wear: "Factory New",
        stattrak: false,
        souvenir: false,
    },
    {
        imageUrl: `${STEAM_IMAGES}i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj_F7Rienhgk1tjyIpYPwJiPTcAAoCpsiEO5ZsUbpm9C2Zuni4VHW3o5EzSX62HxP7Sg96-hWVqYi_6TJz1aW0nxrkGs`,
        rarity: "Covert",
        weapon: "M4A1-S",
        skin: "Printstream",
        wear: "Minimal Wear",
        stattrak: false,
        souvenir: false,
    },
];
