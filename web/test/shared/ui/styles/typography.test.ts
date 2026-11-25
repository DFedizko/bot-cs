import { describe, expect, it } from "bun:test";
import { TYPE_STYLES } from "@/shared/lib/type-styles";

const TYPOGRAPHY_CSS = "@/shared/ui/styles/typography.css";
const TEXT_UTILITY = /@utility\s+text-([\w-]+)\s*\{([^}]*)\}/g;
const FONT_SIZE = /font-size:\s*([^;]+);/;
const FONT_FAMILY = /font-family:\s*([^;]+);/;
const DOOP_FONT_SIZE = /^var\(--text-(xs|sm|base|lg|xl|2xl)\)$/;
const DOOP_FONT_FAMILY = /^var\(--font-(sans|mono)\)$/;

type TextUtility = { name: string; body: string };

const readTextUtilities = async (): Promise<Array<TextUtility>> => {
    const css = await Bun.file(Bun.resolveSync(TYPOGRAPHY_CSS, import.meta.dir)).text();
    return [...css.matchAll(TEXT_UTILITY)].map(([, name, body]) => ({ name, body }));
};

const breaksPattern = (property: RegExp, allowed: RegExp) => (utility: TextUtility) =>
    !allowed.test(property.exec(utility.body)?.[1]?.trim() ?? "");

describe("typography.css", () => {
    it("Should define exactly the text styles cn knows", async () => {
        const utilities = await readTextUtilities();

        const names = utilities.map(({ name }) => name);

        expect([...names].sort()).toEqual([...TYPE_STYLES].sort());
    });

    it("Should size every text style with a doop font size", async () => {
        const utilities = await readTextUtilities();

        const offScale = utilities.filter(breaksPattern(FONT_SIZE, DOOP_FONT_SIZE));

        expect(offScale.map(({ name }) => name)).toEqual([]);
    });

    it("Should set every text style in a doop font family", async () => {
        const utilities = await readTextUtilities();

        const offFamily = utilities.filter(breaksPattern(FONT_FAMILY, DOOP_FONT_FAMILY));

        expect(offFamily.map(({ name }) => name)).toEqual([]);
    });
});
