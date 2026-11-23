// @ts-check

import { registerHooks } from "node:module";

const TYPESCRIPT = "typescript";
const TYPESCRIPT_FOR_ESLINT = "typescript-for-eslint";
const TYPESCRIPT_SPECIFIER = /^typescript(\/.*)?$/;
const OPENAPI_TYPESCRIPT_IMPORTER = /[\\/]node_modules[\\/]openapi-typescript[\\/]/;

const toTypescriptForEslint = (specifier) => TYPESCRIPT_FOR_ESLINT + specifier.slice(TYPESCRIPT.length);

const isOpenapiTypescriptImport = (specifier, parentURL) =>
    TYPESCRIPT_SPECIFIER.test(specifier) && OPENAPI_TYPESCRIPT_IMPORTER.test(parentURL ?? "");

registerHooks({
    resolve: (specifier, context, nextResolve) =>
        nextResolve(
            isOpenapiTypescriptImport(specifier, context.parentURL) ? toTypescriptForEslint(specifier) : specifier,
            context,
        ),
});
