import z from "zod";
import { paginatedSchema } from "@/packages/external/validation/paginated.schema";

const FOO_PAGE = { items: [{ name: "Foo" }], page: 1, pageSize: 20, total: 1 };
const fooPageSchema = paginatedSchema(z.object({ name: z.string() }), FOO_PAGE);

describe("paginatedSchema", () => {
    it("Should accept a page of items", () => {
        const parsed = fooPageSchema.safeParse(FOO_PAGE);

        expect(parsed.success).toBe(true);
    });

    it("Should reject a page whose items don't match the item schema", () => {
        const parsed = fooPageSchema.safeParse({ ...FOO_PAGE, items: [{ name: 1 }] });

        expect(parsed.success).toBe(false);
    });

    it("Should reject a page without its total", () => {
        const parsed = fooPageSchema.safeParse({
            items: FOO_PAGE.items,
            page: FOO_PAGE.page,
            pageSize: FOO_PAGE.pageSize,
        });

        expect(parsed.success).toBe(false);
    });
});
