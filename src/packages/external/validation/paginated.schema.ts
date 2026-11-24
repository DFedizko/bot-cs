import z from "zod";
import type { Paginated } from "@/packages/building-blocks/paginated";

export const paginatedSchema = <TItem extends z.ZodType>(item: TItem, example: Paginated<z.output<TItem>>) =>
    z
        .object({
            items: z.array(item).meta({ description: "The items of the page", examples: [example.items] }),
            page: z
                .number()
                .int()
                .meta({ description: "The page read", examples: [example.page] }),
            pageSize: z
                .number()
                .int()
                .meta({ description: "How many items a page holds", examples: [example.pageSize] }),
            total: z
                .number()
                .int()
                .meta({ description: "How many items match, on every page", examples: [example.total] }),
        })
        .meta({ examples: [example] });
