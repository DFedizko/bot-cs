import type { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import type { ByMykelRarityId } from "./bymykel-skin";

type Named<TName extends string = string> = { name: TName };

export type ByMykelCatalogEntry = {
    market_hash_name: string;
    weapon: Named;
    category: Named;
    pattern?: Named;
    wear?: Named<WearName>;
    stattrak: boolean;
    souvenir?: boolean;
    rarity: { id: ByMykelRarityId };
    image: string;
};
