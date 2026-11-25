import type { AccountDto, ListAccountsResponse } from "../../application/list-accounts/list-accounts.response";
import { WANTED_ITEM_EXAMPLE } from "./wanted-item.example";

export const MAIN_ACCOUNT = {
    id: WANTED_ITEM_EXAMPLE.accountId,
    name: "Empire main",
    balance: { total: 1248036, reserved: 17149, available: 1230887 },
} as const satisfies AccountDto;

const ALT_ACCOUNT: AccountDto = {
    id: "7104022",
    name: "Empire alt",
    balance: { total: 86500, reserved: 0, available: 86500 },
};

export const ACCOUNTS_LIST: ListAccountsResponse = { items: [MAIN_ACCOUNT, ALT_ACCOUNT] };
