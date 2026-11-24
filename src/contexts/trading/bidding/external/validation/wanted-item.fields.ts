import z from "zod";
import { MaxForType, type MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";
import { WANTED_ITEM_EXAMPLE } from "../../infrastructure/docs/wanted-item.example";

const PLAIN_DIGITS = /^\d+$/;
const ACCOUNT_ID_DESCRIPTION = "The CSGOEmpire user id of the account, in plain digits";

export const accountIdField = z
    .string()
    .regex(PLAIN_DIGITS)
    .meta({
        description: ACCOUNT_ID_DESCRIPTION,
        examples: [WANTED_ITEM_EXAMPLE.accountId],
    })
    .transform(Number)
    .pipe(z.number().int().positive())
    .meta({ description: ACCOUNT_ID_DESCRIPTION });

export const itemNameField = z.string().meta({
    description: "The market name of the item, as CSGOEmpire lists it (2 to 100 characters)",
    examples: [WANTED_ITEM_EXAMPLE.name],
});

const MAX_PERCENTAGE_EXAMPLE = { type: MaxForType.PERCENTAGE, value: WANTED_ITEM_EXAMPLE.maxPercentage };
const MAX_VALUE_EXAMPLE = { type: MaxForType.VALUE, value: WANTED_ITEM_EXAMPLE.maxValue };

const maxPercentageField = z
    .object({
        type: z.literal(MaxForType.PERCENTAGE).meta({ description: "The max for is a percentage" }),
        value: z.union([z.string(), z.number()]).meta({
            description: "The percentage over the item's recommended price (-3 pays at most 3% below it)",
            examples: [WANTED_ITEM_EXAMPLE.maxPercentage],
        }),
    })
    .meta({
        description: "The highest price to pay, as a percentage over the item's recommended price",
        examples: [MAX_PERCENTAGE_EXAMPLE],
    });

const maxValueField = z
    .object({
        type: z.literal(MaxForType.VALUE).meta({ description: "The max for is a fixed value" }),
        value: z
            .number()
            .int()
            .meta({
                description: "The highest price to pay, in coin cents (19400 pays at most 194.00 coins), above zero",
                examples: [WANTED_ITEM_EXAMPLE.maxValue],
            }),
    })
    .meta({
        description: "The highest price to pay, as a fixed value whatever the recommended price",
        examples: [MAX_VALUE_EXAMPLE],
    });

type RawMaxFor = z.infer<typeof maxPercentageField> | z.infer<typeof maxValueField>;

const toMaxForPrimitives = (maxFor: RawMaxFor): MaxForPrimitives =>
    maxFor.type === MaxForType.PERCENTAGE ? { ...maxFor, value: String(maxFor.value) } : maxFor;

export const maxForField = z
    .discriminatedUnion("type", [maxPercentageField, maxValueField])
    .meta({
        description: "The highest price to pay: either a percentage over the recommended price or a fixed value",
        examples: [MAX_PERCENTAGE_EXAMPLE, MAX_VALUE_EXAMPLE],
    })
    .transform(toMaxForPrimitives);

export const criteriaField = z
    .array(
        z.object({
            type: z
                .string()
                .meta({ description: "The kind of criterion", examples: [WANTED_ITEM_EXAMPLE.criterionType] }),
            value: z
                .string()
                .meta({ description: "The value the item must match", examples: [WANTED_ITEM_EXAMPLE.wear] }),
        }),
    )
    .meta({
        description: "Extra rules the item must match, such as its wear",
        examples: [[{ type: WANTED_ITEM_EXAMPLE.criterionType, value: WANTED_ITEM_EXAMPLE.wear }]],
    });

export const enabledField = z.boolean().meta({
    description: "true to bid on the item again, false to pause it",
    examples: [WANTED_ITEM_EXAMPLE.enabled],
});

const TRUE = "true";
const FALSE = "false";

export const enabledFilterField = z
    .enum([TRUE, FALSE])
    .meta({
        description: "true lists only the enabled items, false only the disabled ones; leave it out to list both",
        examples: [TRUE],
    })
    .transform((enabled) => enabled === TRUE);
