import type {
    CatalogDetailsByName,
    CatalogDetailsGateway,
} from "../../application/list-wanted-items/catalog-details.gateway";

export class CatalogDetailsGatewayEmptyAdapter implements CatalogDetailsGateway {
    async findByNames(): Promise<CatalogDetailsByName> {
        return new Map();
    }
}
