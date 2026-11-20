// @ts-check

import Module from "node:module";

const TYPESCRIPT = "typescript";
const TYPESCRIPT_FOR_ESLINT = "typescript-for-eslint";
const TYPESCRIPT_SPECIFIER = /^typescript(\/.*)?$/;
const ESLINT_TYPESCRIPT_IMPORTERS = /[\\/]node_modules[\\/](@typescript-eslint[\\/][^\\/]+|ts-api-utils)[\\/]/;

const resolveFilename = Module._resolveFilename;

const isTypescriptSpecifier = (request) => TYPESCRIPT_SPECIFIER.test(request);

const isEslintTypescriptImporter = (parent) =>
    typeof parent?.filename === "string" && ESLINT_TYPESCRIPT_IMPORTERS.test(parent.filename);

const toTypescriptForEslint = (request) => TYPESCRIPT_FOR_ESLINT + request.slice(TYPESCRIPT.length);

const redirectRequest = (request, parent) =>
    isTypescriptSpecifier(request) && isEslintTypescriptImporter(parent) ? toTypescriptForEslint(request) : request;

Module._resolveFilename = function (request, parent, ...rest) {
    return resolveFilename.call(this, redirectRequest(request, parent), parent, ...rest);
};
