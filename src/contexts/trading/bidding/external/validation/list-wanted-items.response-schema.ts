import z from "zod";
import { paginatedSchema } from "@/packages/external/validation/pagination.fields";
import { MaxForType } from "../../domain/wanted-item/max-for/max-for";
import type { ListWantedItemsResponse } from "../../application/list-wanted-items/list-wanted-items.response";
import { WANTED_ITEM_EXAMPLE } from "../../infrastructure/docs/wanted-item.example";
import { WANTED_ITEMS_PAGE } from "../../infrastructure/docs/list-wanted-items.route-doc";

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
    })
    .meta({ examples: WANTED_ITEMS_PAGE.items });

export const listWantedItemsResponseSchema = paginatedSchema(
    wantedItemSchema,
    WANTED_ITEMS_PAGE,
) satisfies z.ZodType<ListWantedItemsResponse>;
