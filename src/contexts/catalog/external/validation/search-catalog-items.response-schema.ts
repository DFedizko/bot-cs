import z from "zod";
import { WearName } from "@/contexts/shared-kernel/domain/wear-name";
import { Rarity } from "../../domain/catalog-item/rarity";
import type { SearchCatalogItemsResponse } from "../../application/search-catalog-items/search-catalog-items.response";
import { CATALOG_ITEM_EXAMPLE, VANILLA_ITEM_EXAMPLE } from "../../infrastructure/docs/catalog-item.example";
import { CATALOG_ITEMS_FOUND } from "../../infrastructure/docs/search-catalog-items.route-doc";

const { marketHashName, weapon, skin, wear, category, rarity, imageUrl } = CATALOG_ITEM_EXAMPLE;

const catalogItemSchema = z
    .object({
        marketHashName: z
            .string()
            .meta({ description: "The market name, as wanted items name the item", examples: [marketHashName] }),
        weapon: z.string().meta({ description: "The weapon, knife or gloves", examples: [weapon] }),
        skin: z
            .string()
            .nullable()
            .meta({ description: "The skin's name, or null for a vanilla item", examples: [skin] }),
        wear: z
            .enum(WearName)
            .nullable()
            .meta({ description: "The wear, or null for an item without wear", examples: [wear] }),
        stattrak: z.boolean().meta({ description: "Whether it is the StatTrak™ version", examples: [false] }),
        souvenir: z.boolean().meta({ description: "Whether it is the Souvenir version", examples: [false] }),
        category: z
            .string()
            .meta({ description: "The item's category, such as Rifles or Knives", examples: [category] }),
        rarity: z.enum(Rarity).meta({ description: "The rarity, in the bot's own vocabulary", examples: [rarity] }),
        imageUrl: z
            .string()
            .meta({ description: "The picture of the item, loaded straight from its CDN", examples: [imageUrl] }),
    })
    .meta({ examples: [CATALOG_ITEM_EXAMPLE, VANILLA_ITEM_EXAMPLE] });

export const searchCatalogItemsResponseSchema = z
    .object({
        items: z.array(catalogItemSchema).meta({
            description: "The matching items: names that start with the text first, then the rest, each alphabetical",
            examples: [CATALOG_ITEMS_FOUND.items],
        }),
    })
    .meta({ examples: [CATALOG_ITEMS_FOUND] }) satisfies z.ZodType<SearchCatalogItemsResponse>;
