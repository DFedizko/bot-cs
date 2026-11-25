import { describe, expect, it } from "bun:test";
import { sizeSteamImage } from "@/shared/lib/size-steam-image";

const STEAM_IMAGE = "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSa";
const SIZE = 256;
const SIZED_STEAM_IMAGE = `${STEAM_IMAGE}/256fx256f`;
const GITHUB_IMAGE = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/images/sticker.png";
const OTHER_STEAM_PATH = "https://community.akamai.steamstatic.com/public/images/avatar.png";
const NOT_A_URL = "not a url";

describe("sizeSteamImage", () => {
    it("Should ask Steam's image server for the given size", () => {
        expect(sizeSteamImage(STEAM_IMAGE, SIZE)).toBe(SIZED_STEAM_IMAGE);
    });

    it("Should replace a size the URL already asks for", () => {
        expect(sizeSteamImage(`${STEAM_IMAGE}/360fx360f`, SIZE)).toBe(SIZED_STEAM_IMAGE);
    });

    it("Should replace a fixed size the URL already asks for", () => {
        expect(sizeSteamImage(`${STEAM_IMAGE}/62x62`, SIZE)).toBe(SIZED_STEAM_IMAGE);
    });

    it("Should keep a URL on another host as it is", () => {
        expect(sizeSteamImage(GITHUB_IMAGE, SIZE)).toBe(GITHUB_IMAGE);
    });

    it("Should keep a Steam URL outside the economy images as it is", () => {
        expect(sizeSteamImage(OTHER_STEAM_PATH, SIZE)).toBe(OTHER_STEAM_PATH);
    });

    it("Should keep a value that is not a URL as it is", () => {
        expect(sizeSteamImage(NOT_A_URL, SIZE)).toBe(NOT_A_URL);
    });
});
