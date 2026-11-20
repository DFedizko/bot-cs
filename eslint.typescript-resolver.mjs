// @ts-check

import { registerHooks } from "node:module";

const TYPESCRIPT = "typescript";
const TYPESCRIPT_FOR_ESLINT = "typescript-for-eslint";
const ESLINT_TYPESCRIPT_IMPORTERS = /\/node_modules\/(@typescript-eslint\/[^/]+|ts-api-utils)\//;

const isTypescriptSpecifier = (specifier) => specifier === TYPESCRIPT || specifier.startsWith(`${TYPESCRIPT}/`);

const isEslintTypescriptImporter = (parentURL) =>
    parentURL !== undefined && ESLINT_TYPESCRIPT_IMPORTERS.test(parentURL);

const toTypescriptForEslint = (specifier) => TYPESCRIPT_FOR_ESLINT + specifier.slice(TYPESCRIPT.length);

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (isTypescriptSpecifier(specifier) && isEslintTypescriptImporter(context.parentURL)) {
            return nextResolve(toTypescriptForEslint(specifier), context);
        }
        return nextResolve(specifier, context);
    },
});
