import z from "zod";
import { paginatedSchema } from "@/packages/external/validation/paginated.schema";
import { MaxForType } from "../../domain/wanted-item/max-for/max-for";
import type { ListWantedItemsResponse } from "../../application/list-wanted-items/list-wanted-items.response";
import { WANTED_ITEM_EXAMPLE } from "../../infrastructure/docs/wanted-item.example";
import {
    ASIIMOV_CATALOG,
    ASIIMOV_WANTED,
    WANTED_ITEMS_PAGE,
} from "../../infrastructure/docs/wanted-items-page.example";
import { Rarity } from "@/contexts/shared-kernel/domain/rarity";

const { name, maxPercentage, maxValue, criterionType, wear } = WANTED_ITEM_EXAMPLE;
const PERCENTAGE_EXAMPLE = { type: MaxForType.PERCENTAGE, value: maxPercentage };
const VALUE_EXAMPLE = { type: MaxForType.VALUE, value: maxValue };
const CRITERION_EXAMPLE = { type: criterionType, value: wear };

const maxPercentageSchema = z
    .object({
        type: z.literal(MaxForType.PERCENTAGE),
        value: z.string().meta({
            description: "The percentage over the item's recommended price",
            examples: [maxPercentage],
        }),
    })
    .meta({ examples: [PERCENTAGE_EXAMPLE] });

const maxValueSchema = z
    .object({
        type: z.literal(MaxForType.VALUE),
        value: z
            .number()
            .int()
            .meta({ description: "The highest price to pay, in coin cents", examples: [maxValue] }),
    })
    .meta({ examples: [VALUE_EXAMPLE] });

const criterionSchema = z
    .object({
        type: z.string().meta({ description: "The kind of criterion", examples: [criterionType] }),
        value: z.string().meta({ description: "The value the item must match", examples: [wear] }),
    })
    .meta({ examples: [CRITERION_EXAMPLE] });

const catalogSchema = z
    .object({
        imageUrl: z.url().meta({
            description: "The picture of the skin, on Steam's image server",
            examples: [ASIIMOV_CATALOG.imageUrl],
        }),
        rarity: z.enum(Rarity).meta({
            description: "The rarity of the skin, from Consumer Grade up to Contraband",
            examples: [ASIIMOV_CATALOG.rarity],
        }),
        weapon: z.string().meta({ description: "The weapon the skin is for", examples: [ASIIMOV_CATALOG.weapon] }),
        skin: z.string().meta({ description: "The name of the skin", examples: [ASIIMOV_CATALOG.skin] }),
        wear: z
            .string()
            .nullable()
            .meta({ description: "The wear of the item, or null when it has none", examples: [ASIIMOV_CATALOG.wear] }),
        stattrak: z
            .boolean()
            .meta({ description: "Whether the item is StatTrak™", examples: [ASIIMOV_CATALOG.stattrak] }),
        souvenir: z
            .boolean()
            .meta({ description: "Whether the item is a souvenir", examples: [ASIIMOV_CATALOG.souvenir] }),
    })
    .meta({ examples: [ASIIMOV_CATALOG] });

const countsSchema = z
    .object({
        all: z
            .number()
            .int()
            .meta({ description: "How many items the account wants", examples: [WANTED_ITEMS_PAGE.counts.all] }),
        enabled: z
            .number()
            .int()
            .meta({ description: "How many of them the bot bids on", examples: [WANTED_ITEMS_PAGE.counts.enabled] }),
        disabled: z
            .number()
            .int()
            .meta({ description: "How many of them are paused", examples: [WANTED_ITEMS_PAGE.counts.disabled] }),
    })
    .meta({
        description: "How many items the account wants, whatever the filter and the page",
        examples: [WANTED_ITEMS_PAGE.counts],
    });

const wantedItemSchema = z
    .object({
        name: z.string().meta({ description: "The market name of the item, as CSGOEmpire lists it", examples: [name] }),
        maxFor: z.discriminatedUnion("type", [maxPercentageSchema, maxValueSchema]).meta({
            description: "The highest price to pay: a percentage over the recommended price or a fixed value",
            examples: [PERCENTAGE_EXAMPLE, VALUE_EXAMPLE],
        }),
        criteria: z.array(criterionSchema).meta({
            description: "Extra rules the item must match, such as its wear",
            examples: [[CRITERION_EXAMPLE]],
        }),
        enabled: z.boolean().meta({ description: "Whether the account bids on the item", examples: [true] }),
        addedAt: z.iso.datetime().meta({
            description: "When the account added the item, in ISO 8601",
            examples: [ASIIMOV_WANTED.addedAt],
        }),
        catalog: catalogSchema.nullable().meta({
            description: "What the catalog knows of the item, or null when it doesn't know it",
            examples: [ASIIMOV_CATALOG, null],
        }),
    })
    .meta({ examples: WANTED_ITEMS_PAGE.items });

export const listWantedItemsResponseSchema = paginatedSchema(wantedItemSchema, WANTED_ITEMS_PAGE)
    .extend({ counts: countsSchema })
    .meta({ examples: [WANTED_ITEMS_PAGE] }) satisfies z.ZodType<ListWantedItemsResponse>;
