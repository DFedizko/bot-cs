import { Outlet, useParams } from "@tanstack/react-router";
import { AccountSwitcherScreen } from "@/features/accounts";
import { AppContent } from "@/shared/ui/layouts/app-content";
import { AppShellLayout } from "@/shared/ui/layouts/app-shell.layout";
import { AppSidebar, AppSidebarFooter, AppSidebarHeader, AppSidebarNavigation } from "@/shared/ui/layouts/app-sidebar";

const ACCOUNT_ROUTE = "/accounts/$accountId";

export function AccountPage() {
    const { accountId } = useParams({ from: ACCOUNT_ROUTE });
    return (
        <AppShellLayout>
            <AppSidebar>
                <AppSidebarHeader />
                <AppSidebarNavigation accountId={accountId} />
                <AppSidebarFooter>
                    <AccountSwitcherScreen accountId={accountId} />
                </AppSidebarFooter>
            </AppSidebar>
            <AppContent>
                <Outlet />
            </AppContent>
        </AppShellLayout>
    );
}
