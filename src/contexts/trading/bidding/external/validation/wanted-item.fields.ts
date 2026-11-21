import z from "zod";
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

export const maxForField = z
    .union([z.string(), z.number()])
    .meta({
        description:
            "The highest price to pay, as a percentage over the item's recommended price (-3 pays at most 3% below it)",
        examples: [WANTED_ITEM_EXAMPLE.maxFor],
    })
    .transform(String);

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
