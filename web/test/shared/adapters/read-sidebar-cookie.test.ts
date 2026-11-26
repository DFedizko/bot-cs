import { describe, expect, it } from "bun:test";
import { readSidebarCookie } from "@/shared/adapters/read-sidebar-cookie";

describe("readSidebarCookie", () => {
    it("Should keep the sidebar open when no cookie remembers it", () => {
        expect(readSidebarCookie("theme=dark")).toBe(true);
    });

    it("Should start collapsed when the cookie remembers it collapsed", () => {
        expect(readSidebarCookie("theme=dark; sidebar_state=false")).toBe(false);
    });

    it("Should start open when the cookie remembers it open", () => {
        expect(readSidebarCookie("sidebar_state=true")).toBe(true);
    });
});
