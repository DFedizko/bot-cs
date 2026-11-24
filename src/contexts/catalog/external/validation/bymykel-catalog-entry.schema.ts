import z from "zod";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import type { ByMykelRarityId } from "../../infrastructure/http/bymykel/types/bymykel-skin";
import type { ByMykelCatalogEntry } from "../../infrastructure/http/bymykel/types/bymykel-catalog-entry";

const RARITY_IDS = [
    "rarity_common_weapon",
    "rarity_uncommon_weapon",
    "rarity_rare_weapon",
    "rarity_mythical_weapon",
    "rarity_legendary_weapon",
    "rarity_ancient_weapon",
    "rarity_ancient",
    "rarity_contraband_weapon",
] as const satisfies readonly ByMykelRarityId[];

const named = z.object({ name: z.string().min(1) });

export const byMykelCatalogEntrySchema = z.object({
    market_hash_name: z.string().trim().min(1),
    weapon: named,
    category: named,
    pattern: named.optional(),
    wear: z.object({ name: z.enum(WearName) }).optional(),
    stattrak: z.boolean(),
    souvenir: z.boolean().optional(),
    rarity: z.object({ id: z.enum(RARITY_IDS) }),
    image: z.url(),
}) satisfies z.ZodType<ByMykelCatalogEntry>;
