import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/shared/ui/components/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/shared/ui/components/sidebar";
import { Skeleton } from "@/shared/ui/components/skeleton";
import { AppSidebarLabel } from "@/shared/ui/layouts/app-sidebar";
import type { AccountSwitcherViewModel } from "../view-model/useAccountSwitcherViewModel";
import { AccountChip, AccountChipAvatar, AccountChipDetails } from "./components/account-chip";

const CHECK_STROKE = 2.4;

export function AccountSwitcherView({ status, current, accounts }: AccountSwitcherViewModel) {
    if (status === "loading") return <Skeleton aria-label="Loading accounts" className="h-12 w-full" />;
    if (!current) return <p className="px-2 text-helper text-faint">Accounts unavailable</p>;
    return (
        <SidebarMenu className="border-t border-line pt-3">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                aria-label={`Switch account, ${current.name}`}
                                className="h-12 gap-3 px-2 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-1! hover:bg-surface"
                            />
                        }
                    >
                        <AccountChip>
                            <AccountChipAvatar>{current.initial}</AccountChipAvatar>
                            <AppSidebarLabel className="flex min-w-0 flex-1 items-center gap-2">
                                <AccountChipDetails account={current} />
                                <span title="Bot online" className="size-2 shrink-0 rounded-full bg-positive" />
                            </AppSidebarLabel>
                        </AccountChip>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" className="w-60">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-label text-faint">Accounts</DropdownMenuLabel>
                            {accounts.map((account) => (
                                <DropdownMenuItem
                                    key={account.id}
                                    className="gap-3"
                                    render={
                                        <Link
                                            to="/accounts/$accountId/wanted-items"
                                            params={{ accountId: account.id }}
                                        />
                                    }
                                >
                                    <AccountChipAvatar>{account.initial}</AccountChipAvatar>
                                    <AccountChipDetails account={account} />
                                    {account.isCurrent && (
                                        <Check
                                            aria-label="Current account"
                                            className="size-4 text-accent"
                                            strokeWidth={CHECK_STROKE}
                                        />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
