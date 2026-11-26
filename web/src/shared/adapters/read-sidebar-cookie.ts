const SIDEBAR_COOKIE = "sidebar_state";
const COLLAPSED = "false";
const COOKIE_SEPARATOR = ";";
const VALUE_SEPARATOR = "=";

const toEntry = (cookie: string) => cookie.trim().split(VALUE_SEPARATOR);

export function readSidebarCookie(cookies: string = document.cookie): boolean {
    const entry = cookies
        .split(COOKIE_SEPARATOR)
        .map(toEntry)
        .find(([name]) => name === SIDEBAR_COOKIE);
    return entry?.[1] !== COLLAPSED;
}
