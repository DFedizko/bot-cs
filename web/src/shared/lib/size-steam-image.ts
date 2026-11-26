const STEAM_IMAGE_HOST = "community.akamai.steamstatic.com";
const STEAM_IMAGE_PATH = "/economy/image/";
const SIZE_SUFFIX = /\/\d+f?x\d+f?$/;

const parseUrl = (value: string) => (URL.canParse(value) ? new URL(value) : null);

const isSteamImage = (url: URL) => url.host === STEAM_IMAGE_HOST && url.pathname.startsWith(STEAM_IMAGE_PATH);

export function sizeSteamImage(imageUrl: string, size: number): string {
    const url = parseUrl(imageUrl);
    if (!url || !isSteamImage(url)) return imageUrl;
    return `${imageUrl.replace(SIZE_SUFFIX, "")}/${size}fx${size}f`;
}
