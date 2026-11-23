import { describe, expect, it } from "bun:test";
import { readDeclarations } from "./__builders__/read-declarations";
import type { Declaration } from "./__builders__/read-declarations";

type DoopToken = { name: string; type: string; value: string };

const TOKENS_CSS = "@/shared/ui/styles/tokens.css";
const DOOP_EXPORT = "@/shared/ui/styles/doop-tokens.json";
const RESET = "initial";
const FONT_FAMILY = "fontFamily";
const FIRST_QUOTED = /"([^"]+)"/;
const SPACES = /\s+/g;
const DOOP_SCALES = ["--color-*", "--radius-*", "--spacing-*", "--text-*"];

const readDoopTokens = async (): Promise<Array<DoopToken>> => {
    const exported = await Bun.file(Bun.resolveSync(DOOP_EXPORT, import.meta.dir)).json();
    return exported.tokens;
};

const readThemeValues = async () => {
    const declarations = await readDeclarations(TOKENS_CSS);
    return declarations.filter(({ value }) => value !== RESET);
};

const normalize = (value: string) => value.replace(SPACES, "").toLowerCase();

const bundledFontStack = (doopValue: string) => `"${FIRST_QUOTED.exec(doopValue)?.[1]} Variable", ${doopValue}`;

const expectedValue = ({ type, value }: DoopToken) => (type === FONT_FAMILY ? bundledFontStack(value) : value);

const toEntry = (token: DoopToken) => [token.name, normalize(expectedValue(token))];

const toThemeEntry = ({ name, value }: Declaration) => [name, normalize(value)];

describe("tokens.css", () => {
    it("Should give every doop token its theme value", async () => {
        const doopTokens = await readDoopTokens();

        const theme = Object.fromEntries((await readThemeValues()).map(toThemeEntry));

        expect(theme).toMatchObject(Object.fromEntries(doopTokens.map(toEntry)));
    });

    it("Should define no theme value that doop doesn't have", async () => {
        const doopNames = (await readDoopTokens()).map(({ name }) => name);

        const themeNames = (await readThemeValues()).map(({ name }) => name);

        expect([...themeNames].sort()).toEqual([...doopNames].sort());
    });

    it("Should reset Tailwind's defaults for every scale doop defines", async () => {
        const resets = (await readDeclarations(TOKENS_CSS)).filter(({ value }) => value === RESET);

        expect([...resets.map(({ name }) => name)].sort()).toEqual([...DOOP_SCALES].sort());
    });
});
