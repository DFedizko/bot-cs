import { listAccountsResponseSchema } from "@/contexts/trading/bidding/external/validation/list-accounts.response-schema";
import { ACCOUNTS_LIST } from "@/contexts/trading/bidding/infrastructure/docs/accounts.example";

const [MAIN] = ACCOUNTS_LIST.items;

describe("listAccountsResponseSchema", () => {
    it("Should accept the documented example list", () => {
        const parsed = listAccountsResponseSchema.safeParse(ACCOUNTS_LIST);

        expect(parsed.success).toBe(true);
    });

    it("Should document two accounts", () => {
        expect(ACCOUNTS_LIST.items.map(({ name }) => name)).toEqual(["Empire main", "Empire alt"]);
    });

    it("Should reject an id that is not in plain digits", () => {
        const parsed = listAccountsResponseSchema.safeParse({ items: [{ ...MAIN, id: "main" }] });

        expect(parsed.success).toBe(false);
    });

    it("Should reject an amount that is not in whole coin cents", () => {
        const parsed = listAccountsResponseSchema.safeParse({
            items: [{ ...MAIN, balance: { ...MAIN.balance, total: 12480.36 } }],
        });

        expect(parsed.success).toBe(false);
    });
});
