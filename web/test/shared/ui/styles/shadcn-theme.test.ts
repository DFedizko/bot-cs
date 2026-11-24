import { describe, expect, it } from "bun:test";
import { readDeclarations } from "./__builders__/read-declarations";
import type { Declaration } from "./__builders__/read-declarations";

const SHADCN_THEME_CSS = "@/shared/ui/styles/shadcn-theme.css";
const DOOP_EXPORT = "@/shared/ui/styles/doop-tokens.json";
const VARIABLE_REFERENCE = /^var\((--[\w-]+)\)$/;
const THEME_PREFIX = "--color-";
const SHADCN_VARIABLES = [
    "--background",
    "--foreground",
    "--card",
    "--card-foreground",
    "--popover",
    "--popover-foreground",
    "--primary",
    "--primary-foreground",
    "--secondary",
    "--secondary-foreground",
    "--muted",
    "--muted-foreground",
    "--accent",
    "--accent-foreground",
    "--destructive",
    "--border",
    "--input",
    "--ring",
    "--radius",
    "--chart-1",
    "--chart-2",
    "--chart-3",
    "--chart-4",
    "--chart-5",
    "--sidebar",
    "--sidebar-foreground",
    "--sidebar-primary",
    "--sidebar-primary-foreground",
    "--sidebar-accent",
    "--sidebar-accent-foreground",
    "--sidebar-border",
    "--sidebar-ring",
];

const readDoopNames = async (): Promise<Array<string>> => {
    const exported = await Bun.file(Bun.resolveSync(DOOP_EXPORT, import.meta.dir)).json();
    return exported.tokens.map(({ name }: { name: string }) => name);
};

const isShadcnVariable = ({ name }: Declaration) => SHADCN_VARIABLES.includes(name);

const referencedName = ({ value }: Declaration) => VARIABLE_REFERENCE.exec(value)?.[1];

const isThemeEntry = ({ name }: Declaration) => name.startsWith(THEME_PREFIX);

describe("shadcn-theme.css", () => {
    it("Should define every variable shadcn components read", async () => {
        const declarations = await readDeclarations(SHADCN_THEME_CSS);

        const defined = declarations.filter(isShadcnVariable).map(({ name }) => name);

        expect([...defined].sort()).toEqual([...SHADCN_VARIABLES].sort());
    });

    it("Should point every shadcn variable at a doop token", async () => {
        const doopNames = await readDoopNames();

        const referenced = (await readDeclarations(SHADCN_THEME_CSS)).filter(isShadcnVariable).map(referencedName);

        expect(referenced.filter((name) => !doopNames.includes(name ?? ""))).toEqual([]);
    });

    it("Should register only shadcn variables as theme colours", async () => {
        const themeEntries = (await readDeclarations(SHADCN_THEME_CSS)).filter(isThemeEntry);

        const referenced = themeEntries.map(referencedName);

        expect(referenced.filter((name) => !SHADCN_VARIABLES.includes(name ?? ""))).toEqual([]);
    });
});
