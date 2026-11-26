import type {
    CatalogDetailsByName,
    CatalogDetailsGateway,
} from "@/contexts/trading/bidding/application/list-wanted-items/catalog-details.gateway";

export class CatalogDetailsGatewayFakeAdapter implements CatalogDetailsGateway {
    constructor(private readonly details: CatalogDetailsByName = new Map()) {}

    async findByNames(names: string[]): Promise<CatalogDetailsByName> {
        const known = names.flatMap((name) => {
            const found = this.details.get(name);
            return found ? [[name, { ...found }] as const] : [];
        });
        return new Map(known);
    }
}
