import type { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { ImageUrl } from "./image-url";
import { MarketHashName } from "./market-hash-name";
import type { Rarity } from "./rarity";

export type CatalogItemPrimitives = {
    marketHashName: string;
    weapon: string;
    skin: string | null;
    wear: WearName | null;
    stattrak: boolean;
    souvenir: boolean;
    category: string;
    rarity: Rarity;
    imageUrl: string;
};

export class CatalogItem {
    private constructor(private readonly primitives: CatalogItemPrimitives) {
        Object.freeze(this);
    }

    static create(primitives: CatalogItemPrimitives): CatalogItem {
        const marketHashName = new MarketHashName(primitives.marketHashName).getValue();
        const imageUrl = new ImageUrl(primitives.imageUrl).getValue();
        return new CatalogItem(Object.freeze({ ...primitives, marketHashName, imageUrl }));
    }

    get marketHashName(): string {
        return this.primitives.marketHashName;
    }

    toPrimitives(): CatalogItemPrimitives {
        return { ...this.primitives };
    }
}
