import { afterEach, expect } from "bun:test";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

const EXPIRED = "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

const clearCookies = () =>
    document.cookie
        .split(";")
        .map((cookie) => cookie.split("=")[0].trim())
        .filter(Boolean)
        .forEach((name) => (document.cookie = `${name}${EXPIRED}`));

expect.extend(matchers);

afterEach(() => {
    cleanup();
    clearCookies();
});
