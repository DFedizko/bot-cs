import type { CatalogItemDto, CatalogLookup } from "@/contexts/catalog";
import type {
    CatalogDetailsByName,
    CatalogDetailsDto,
    CatalogDetailsGateway,
} from "../../application/list-wanted-items/catalog-details.gateway";

export class CatalogDetailsGatewayAdapter implements CatalogDetailsGateway {
    static readonly VANILLA_SKIN = "Vanilla";

    constructor(private readonly lookup: CatalogLookup) {}

    async findByNames(names: string[]): Promise<CatalogDetailsByName> {
        const { items } = await this.lookup.findByNames(names);
        return new Map(items.map((item) => [item.marketHashName, this.mapToDetails(item)]));
    }

    private mapToDetails(item: CatalogItemDto): CatalogDetailsDto {
        const { imageUrl, rarity, weapon, skin, wear, stattrak, souvenir } = item;
        const displayedSkin = skin ?? CatalogDetailsGatewayAdapter.VANILLA_SKIN;
        return { imageUrl, rarity, weapon, skin: displayedSkin, wear, stattrak, souvenir };
    }
}
