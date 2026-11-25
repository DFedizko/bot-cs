const DECLARATION = /(--[\w*-]+)\s*:\s*([^;{}]+);/g;
const WHITESPACE = /\s+/g;

export type Declaration = { name: string; value: string };

const toDeclaration = ([, name, value]: RegExpMatchArray): Declaration => ({
    name,
    value: value.replace(WHITESPACE, " ").trim(),
});

export async function readDeclarations(stylePath: string): Promise<Array<Declaration>> {
    const css = await Bun.file(Bun.resolveSync(stylePath, import.meta.dir)).text();
    return [...css.matchAll(DECLARATION)].map(toDeclaration);
}
