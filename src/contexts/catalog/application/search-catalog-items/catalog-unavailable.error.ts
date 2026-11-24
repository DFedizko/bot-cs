import { BaseError } from "@/packages/building-blocks/base-error";

export class CatalogUnavailableError extends BaseError {
    static readonly CODE = "CATALOG_UNAVAILABLE";
    static readonly MESSAGE = "The catalog is not loaded yet; try again in a moment";

    constructor() {
        super({ message: CatalogUnavailableError.MESSAGE, code: CatalogUnavailableError.CODE });
    }
}
